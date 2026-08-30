export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = env.CORS_ORIGIN || "*";

    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
      });

    try {
      if (path === "/health") return json({ ok: true, ts: Date.now() });

      if (path === "/bids" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT spot_id, sponsor, amount, url, status FROM bids WHERE status = 'active'"
        ).all();
        const out = {};
        for (const r of results || []) {
          out[r.spot_id] = {
            sponsor: r.sponsor,
            amount: r.amount,
            url: r.url,
            hasLogo: true,
          };
        }
        return json(out);
      }

      if (path === "/history" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT spot_id, sponsor, amount, ts FROM history ORDER BY id DESC LIMIT 200"
        ).all();
        return json(results || []);
      }

      if (path === "/bid" && method === "POST") {
        const body = await request.json();
        const { spotId, sponsor, amount, email, url: bidUrl, logo } = body;

        if (!spotId || !sponsor || !amount || !email || !logo) {
          return json({ error: "Missing required fields." }, 400);
        }
        if (!/.+@.+\..+/.test(email)) return json({ error: "Invalid email." }, 400);

        const closeTs = Date.parse(env.AUCTION_CLOSE || "2099-12-31T00:00:00Z");
        if (Date.now() > closeTs) return json({ error: "Auction has closed." }, 403);

        const { results: minRows } = await env.DB.prepare(
          "SELECT amount FROM bids WHERE spot_id = ? AND status = 'active'"
        ).bind(spotId).all();
        const currentTop = (minRows && minRows[0] && minRows[0].amount) || 0;
        const minBid = currentTop ? currentTop + 10 : 100;
        if (amount < minBid) {
          return json({ error: `Minimum bid is A$${minBid}.` }, 409);
        }

        const prev = await env.DB.prepare(
          "SELECT email FROM bids WHERE spot_id = ? AND status = 'active'"
        ).bind(spotId).first();

        const bidderId = crypto.randomUUID();
        const now = new Date().toISOString();
        const status = env.STRIPE_SECRET_KEY ? "pending" : "active";

        await env.DB.prepare(
          `INSERT INTO bids (spot_id, sponsor, amount, email, url, logo_data, bidder_id, created_at, status)
           VALUES (?,?,?,?,?,?,?,?,?)
           ON CONFLICT(spot_id) DO UPDATE SET
             sponsor=excluded.sponsor, amount=excluded.amount, email=excluded.email,
             url=excluded.url, logo_data=excluded.logo_data, bidder_id=excluded.bidder_id,
             created_at=excluded.created_at, status=excluded.status`
        ).bind(spotId, sponsor, amount, email, bidUrl || null, logo, bidderId, now, status).run();

        await env.DB.prepare(
          "INSERT INTO history (spot_id, sponsor, amount, email, ts) VALUES (?,?,?,?,?)"
        ).bind(spotId, sponsor, amount, email, now).run();

        if (env.RESEND_API_KEY) {
          if (prev && prev.email && prev.email !== email) {
            await sendOutbidEmail(env, prev.email, spotId, amount);
          }
          if (env.OWNER_EMAIL) {
            await sendOwnerNotify(env, spotId, sponsor, amount, email);
          }
        }

        return json({ ok: true, bidderId, status });
      }

      if (path === "/confirm" && method === "POST") {
        const body = await request.json();
        const { spotId, bidderId } = body;
        if (!spotId || !bidderId) return json({ error: "Missing spotId or bidderId." }, 400);

        const row = await env.DB.prepare(
          "SELECT bidder_id, status FROM bids WHERE spot_id = ?"
        ).bind(spotId).first();

        if (!row) return json({ error: "Bid not found." }, 404);
        if (row.bidder_id !== bidderId) return json({ error: "Invalid bidder token." }, 403);
        if (row.status === "active") return json({ ok: true, alreadyActive: true });

        await env.DB.prepare(
          "UPDATE bids SET status = 'active' WHERE spot_id = ? AND bidder_id = ?"
        ).bind(spotId, bidderId).run();

        return json({ ok: true });
      }

      if (path.startsWith("/logo/") && method === "GET") {
        const spotId = path.slice(6);
        const row = await env.DB.prepare(
          "SELECT logo_data FROM bids WHERE spot_id = ? AND status = 'active'"
        ).bind(spotId).first();
        if (!row || !row.logo_data) return json({ error: "No logo." }, 404);
        return new Response(row.logo_data, {
          headers: { "Content-Type": "text/plain", ...cors },
        });
      }

      if (path === "/deposit" && method === "POST") {
        const { amount, spotId, sponsor, email: custEmail, bidderId } = await request.json();
        if (!amount || amount < 100) return json({ error: "Invalid amount." }, 400);
        const depositDollars = Math.round(amount * (env.DEPOSIT_PCT || 20) / 100);
        const depositCents = depositDollars * 100;
        const siteUrl = env.CORS_ORIGIN || "https://notghostingyou.xyz";

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "mode": "payment",
            "success_url": `${siteUrl}/?deposit=ok&spot=${spotId}&bidder=${bidderId || ""}`,
            "cancel_url": `${siteUrl}/?deposit=cancel&spot=${spotId}`,
            "customer_email": custEmail || "",
            "line_items[0][quantity]": "1",
            "line_items[0][price_data][currency]": env.CURRENCY || "aud",
            "line_items[0][price_data][unit_amount]": String(depositCents),
            "line_items[0][price_data][product_data][name]": `20% deposit — ${sponsor} on ${spotId}`,
            "line_items[0][price_data][product_data][description]": "Refundable auction deposit. Refunded in full if outbid; counts toward your total if you win.",
            "submit_type": "pay",
            ...(bidderId ? { "metadata[bidder_id]": bidderId, "metadata[spot_id]": spotId } : {}),
          }),
        });
        const session = await stripeRes.json();
        if (!stripeRes.ok) return json({ error: session.error?.message || "Stripe error." }, 502);
        return json({ checkoutUrl: session.url, depositAmount: depositDollars });
      }

      if (path === "/waitlist" && method === "POST") {
        const { email } = await request.json();
        if (!email || !/.+@.+\..+/.test(email)) return json({ error: "Invalid email." }, 400);
        const now = new Date().toISOString();
        await env.DB.prepare(
          "INSERT INTO waitlist (email, created_at) VALUES (?,?) ON CONFLICT(email) DO NOTHING"
        ).bind(email, now).run();
        return json({ ok: true });
      }

      if (path === "/admin/bids" && method === "GET") {
        if (!checkAuth(request, env)) return json({ error: "Unauthorized." }, 401);
        const { results } = await env.DB.prepare(
          "SELECT * FROM bids ORDER BY amount DESC"
        ).all();
        return json(results || []);
      }

      if (path === "/admin/export" && method === "GET") {
        if (!checkAuth(request, env)) return json({ error: "Unauthorized." }, 401);
        const { results: b } = await env.DB.prepare("SELECT * FROM bids").all();
        const { results: h } = await env.DB.prepare("SELECT * FROM history ORDER BY id DESC").all();
        const { results: w } = await env.DB.prepare("SELECT * FROM waitlist ORDER BY created_at DESC").all();
        return json({ bids: b, history: h, waitlist: w });
      }

      return json({ error: "Not found." }, 404);
    } catch (err) {
      return json({ error: err.message || "Server error." }, 500);
    }
  },
};

function checkAuth(request, env) {
  const tok = request.headers.get("X-Auth-Token");
  return env.AUTH_TOKEN && tok === env.AUTH_TOKEN;
}

async function sendOutbidEmail(env, toEmail, spotId, newAmount) {
  const from = env.FROM_EMAIL || "auction@notghostingyou.xyz";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toEmail,
      subject: "You've been outbid — Brand the Device",
      html: `<p>Someone outbid you on the <strong>${spotId}</strong> spot (new top bid: A$${newAmount}).</p>
              <p><a href="https://notghostingyou.xyz/">Come back and raise your bid</a> before the auction closes.</p>`,
    }),
  });
}

async function sendOwnerNotify(env, spotId, sponsor, amount, email) {
  const from = env.FROM_EMAIL || "auction@notghostingyou.xyz";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: env.OWNER_EMAIL,
      subject: `New bid: ${sponsor} — A$${amount} on ${spotId}`,
      html: `<p><strong>${sponsor}</strong> bid A$${amount} on <strong>${spotId}</strong>.</p>
              <p>Email: ${email}</p><p><a href="https://notghostingyou.xyz/">View auction</a></p>`,
    }),
  });
}
