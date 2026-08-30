# Brand the Device — MacBook lid-ad fundraiser (draft v9)

A zero-dependency static SPA: auction the **12 lid spots** of a 16-inch MacBook Pro
(M5 Max, 128GB / 2TB SSD, nano-texture) that pays for itself — before it's bought.

> **Status: DRAFT. Demo mode (apiBase = null).** v9 adds the **backend Worker**
> (Cloudflare Workers + D1 + R2 + Stripe Checkout + Resend email) — code-ready,
> deploys when the operator provides a Cloudflare API token + Stripe keys. Frontend
> auto-switches to live mode the moment `DATA.apiBase` + `DATA.stripePublicKey` are
> set in `js/data.js`.
> v8 = **one fixed goal, no tiers**: the machine is always the M5 Max 128GB/2TB
> nano-texture (≈A$11,833 retail → ≈A$17,530 gross after ~32.5% tax). If the raise
> falls short, the developer **tops up the difference from his own money**, so the
> specs are never downgraded. The A$6,000 floor / full-refund guard stays. All
> mentions of the original 14-inch run (the proof band, the "Brand My Mac" FAQ, and
> the "sequel / viral / sold out" copy) are **gone** — an original stunner this time.
> v7 = **EUR dropped, AUD ⇄ USD view toggle added** (header, persisted):
> all live prices convert at a fixed display rate (≈0.71, 2026-08), bids still
> settle in AUD at checkout.
> v6 = launch-prep batch: **OG/Twitter meta + favicon + OG image** (the link preview
> is the product for a social stunt), **Apple glyph swapped** for a self-drawn SVG
> silhouette (renders on all devices, no tofu / no trademark char), **currency
> format unified to A$**, **ladder renamed Floor→T3** (was T0–T3) so it matched the
> specs card, **meta-band wording softened**, and a **LAUNCH_PLAN.md**
> (gates, timeline to 2026-09-30 close, X-thread skeleton, risk table).
> v5 = go-live blockers fixed in the frontend: **logo upload is required to bid**
> (it's the vinyl-sticker file), email + URL captured, demo sponsor names scrubbed
> to clearly-fictional picks, progress bars fill incrementally, preset chips can never
> go under the minimum, countdown stops at close, config card shows the covered
> goal, bid counts per spot, hero activity ticker, storage works on file:// too.
> `[LAUNCH]` items are real-world TODOs.

## Run it

```bash
cd /Users/anonymousbrat/Downloads/Munder_Difflin/ventures/lid-fundraiser
python3 -m http.server 8731   # or double-click index.html
```

## Launch plan

See **`LAUNCH_PLAN.md`** — gates (domain / Stripe / backend), timeline to the
2026-09-30 close, X-thread skeleton, content calendar, risk/fallback table.

## v9 changes (backend + frontend wiring)

| Area | What changed |
|---|---|
| Backend | **Cloudflare Worker** (`worker/`) — D1 (bids + history + waitlist tables), R2 (logo file storage), Stripe Checkout Sessions (20% refundable deposit), Resend email (outbid alerts + founder notifications). Endpoints: `GET /bids`, `GET /history`, `POST /bid`, `POST /deposit`, `GET /logo/:key`, `POST /waitlist`, `GET /admin/bids`, `GET /admin/export`, `GET /health` |
| Frontend | `js/app.js` now **auto-boots from the API** when `DATA.apiBase` is set (fetches bids + history, renders); **30s poller** refreshes the board so bidders see outbids live; bid submit **POSTs to the API** (logo as base64); if `DATA.stripePublicKey` is set, redirects to Stripe Checkout for the deposit after the bid is placed; waitlist **POSTs to the API** |
| Config | `apiBase: null` + `stripePublicKey: null` in `js/data.js` = demo mode (localStorage, no charges). Set both to go live |

## Backend deploy (Cloudflare Worker)

```bash
cd worker
npx wrangler login                          # or: CLOUDFLARE_API_TOKEN=… wrangler deploy
npx wrangler d1 create btd-bids             # paste the database_id into wrangler.toml
npx wrangler d1 create btd-bids --remote    # if needed
npx wrangler d1 execute btd-bids --file=schema.sql --remote
npx wrangler r2 bucket create btd-logos
npx wrangler secret put STRIPE_SECRET_KEY   # sk_live_… or sk_test_…
npx wrangler secret put RESEND_API_KEY      # re_… (optional — outbid emails)
npx wrangler secret put FROM_EMAIL          # "Brand the Device <auction@notghostingyou.xyz>"
npx wrangler secret put OWNER_EMAIL         # founder notifications
npx wrangler secret put AUTH_TOKEN          # shared secret for /admin/* endpoints
npx wrangler deploy
```

Then set `DATA.apiBase` to the Worker URL (e.g. `https://notghostingyou-api.workers.dev`)
and `DATA.stripePublicKey` to the Stripe publishable key in `js/data.js`, commit, push.

## v8 changes

| Area | What changed |
|---|---|
| Goal | **One fixed machine — no tiers**: M5 Max, 128GB / 2TB SSD, nano-texture (≈A$11,833 retail → ≈A$17,530 gross after ~32.5% tax). Config card, spec table, and JSON all reference the single goal |
| Top-up pledge | If the raise falls short, the **developer pools in the difference from his own money** — the lid is never downgraded. Hero badge ("Floor passed — dev tops up the rest"), progress label (shortfall figure), tier card, FAQ, press + footer copy all state it |
| Progress | Progress card now renders **2 bars: the A$6,000 Floor (go/no-go) → the fixed goal**. No T1–T4 ladder |
| Proof band | **Removed** ("This worked before", "top spot on the original 14-inch", etc.) |
| Original-run mentions | Scrubbed everywhere: no sequel/14-inch/viral/sold-out copy, no "Brand My Mac" FAQ item, hero + footer rewrites — reads as an original stunt now |
| Lid spots | 12 spots on a **3×3 sector layout**: N / E / S / W are the big directional spots, each corner splits into two 4×4 cm squares, center cell = Apple-logo guard ring; carousel = **Live auction ⇄ Final look**; base grid still = exactly A$6,000 = the floor |

## v7 changes

| Area | What changed |
|---|---|
| Currency | **EUR removed everywhere** — all prices/tiers/bars/modal/ticker convert at the display rate |
| Toggle | **AUD ⇄ USD view toggle** in the header (persisted). All live prices, bars, modal amounts, ticker convert at a fixed display rate (FX ≈ 0.71 US$/A$); the toggle explicitly says bids still **settle in AUD** |
| Modal | Bid input accepts the displayed currency (min + preset chips convert); bid is stored in AUD, so math stays true |

## v6 changes (launch-prep, frontend + docs)

| Area | What changed |
|---|---|
| OG / link preview | `og:*` + Twitter card meta + `favicon.svg` + `og-image.svg` → `og-image.png` (1200×630). The preview is the product for a social stunt; site copy stays the source of truth |
| Apple glyph | `U+F8FF` private-use char (tofu on non-Apple devices) replaced with a self-drawn SVG silhouette on the lid mock — renders everywhere, no trademark char |
| Currency | `DATA.display` unified to `A$` everywhere (was `$` in generated numbers vs `A$` in copy) |
| Ladder naming | Hero floor bar renamed `T0` → `Floor` so the two ladders read consistently (Floor → T3 hero / T1 → T4 specs) |
| Meta band | Softened to "the space around the logo is for sale" (removed implied Apple endorsement) |
| Launch plan | **`LAUNCH_PLAN.md`** added: gates (G1 domain, G2 Stripe, G3 backend), T-14→close timeline, X-thread skeleton, content calendar, risks |

## v5 changes (go-live blockers, frontend)

| Area | What changed |
|---|---|
| Logo upload | **Required on every bid** — SVG/PNG/JPG ≤ 256 KB, validated live, preview shown in the modal. It's the file that becomes the die-cut vinyl sticker; bid is refused without it. Logos render on the lid mock + spot list |
| Email + URL | Bid captures **email** (outbid alerts + payment link at launch) and optional **website** (sponsor name links to it — the FAQ promise now has data behind it) |
| Demo sponsors | Scrubbed to clearly-fictional names (Panthrex, Orbitdesk, …) — no implied endorsements from real brands |
| Progress bars | **Truly incremental now**: a bar only fills once every previous bar is passed (goal stays 0% until the floor passes); copy matches ("Bars fill one at a time") |
| Preset chips | Derived from the minimum valid bid — no chip can ever propose an invalid amount |
| Countdown | Interval stops after the auction closes |
| Config card | Shows coverage of the **single fixed goal** (was: next uncovered tier's price — overstated) |
| Social proof | **Bid counts per spot** on the list ("3 bids") + **hero activity ticker** ("Latest: X bid A$Y on … · 2h ago") |
| History | Seeded timestamps spread ~47 min apart — no longer 12 bids stamped 'now' |
| Robustness | Storage falls back to in-memory on file:// / private mode; hero badge names the goal state; owner X-link is wired to `DATA.ownerLink` |

## v4 changes (baseline)

| Area | What changed |
|---|---|
| Brand | Renamed **Brand the Lid → Brand the Device** (device-agnostic for the SaaS end-game; this campaign is one device). All copy, meta, footer updated |
| Theme | **Light (white) is the default**; dark is a toggle, persisted, top-right |
| Sticker sizes | Real cm dimensions + cm² on every spot (marquee 14×6=84, flanks 8×9=72, snipe 14×5=70, minis 4×4=16) |
| Prices | Spot prices rescaled so the **full base grid = exactly A$6,000 = the floor**: corner squares A$250, South A$800, East/West A$1,000, Marquee A$1,200. Outbids are what climb toward the goal |
| Lid division | Proper 16" (282×197mm) split — Apple mark keeps only a **slim ~5mm guard ring**; 3×3 sectors, 8 corner squares |
| Floor | **A$6,000 minimum → full refund** below it |
| Goal | **One fixed machine — the M5 Max 128GB / 2TB SSD, nano-texture** (≈A$11,833 retail, anchored to the verified 48GB/2TB + AU steps). Retail ÷ 0.675 = ≈A$17,530 gross-to-raise. No tiers — the developer tops up any shortfall from his own money |
| Progress | **2 incremental bars (A$6,000 Floor → the fixed goal)** — the goal fills only once the floor is passed; stretch note = "every dollar above the goal tops up what the developer keeps" |
| Story | Owner-voice hero, public P&L promise, advertiser section, floor/refund guard first, top-up pledge in the machine + FAQ + press + footer |
| Added | Live countdown (closes 2026-09-30T20:00Z), bid-history log, **The product** SaaS-teaser (the waitlist play), **For the press** fact sheet |
| Modal | Anchored preset bid chips (behavioral anchoring) |

## Research notes — selling the story (four mindsets)

Advice baked into the copy above. Sources: crowdfunding/psychology literature (GoodHub, Charity Digital / Reflect Digital, The Agitator):

1. **Journalist / viral mindset** — the story's hook is the twist ("bought before he owns it") plus a number and an arc — and it's an original stunt, not a sequel. Add: a launch X-thread with a video, a press one-pager, and the promise to **publish the full P&L**. Do NOT write a 500-word backstory.
2. **Sponsor / media-buy mindset** — sponsors aren't donors; frame it as a cheap, measureable, novel media buy: 16-inch moving billboard, placement photo + link, and the "one fixed machine, developer tops up any shortfall" guarantee (never a downgraded lid). Do NOT promise hard impression/CPM numbers you can't deliver.
3. **Apple / brand-safety mindset** — removable residue-free vinyl, slim guard ring so the Apple mark stays untouched, accurate product names, "not affiliated" legalese. A respectful, coherent lid reads as premium and sells higher spots. Do NOT mock Apple or imply endorsement.
4. **Consumer psychology mindset** — open with who + the twist, not a pitch; lead with the refund/floor guard (trust); anchor bid values; show social proof (bid board) and scarcity (only 12 spots); specificity (cm, A$, dates) builds believability. Do NOT fake hardship — it's a self-aware stunt, not charity; credibility dies instantly if it reads as a sob story.

## Launch checklist

> Lead with **`LAUNCH_PLAN.md`** for sequencing. Checklist = the raw TODO list.

- [x] OG/Twitter meta + favicon + OG image, done in v6 (`index.html` head, `favicon.svg`, `og-image.png`).
- [ ] Real brand assets/domain (site copy already says **Brand the Device**).
- [ ] Lock the single goal's retail price on apple.com/au at launch; update `DATA.goal` + `floor`. Anchor verified (48GB/2TB = A$7,999) — re-check the ≈ A$ delta for 128GB/2TB + nano-texture on the actual configurator.
- [x] **Backend scaffold** (v9): Cloudflare Worker with D1 bids DB, R2 logo storage, Stripe Checkout deposits, Resend outbid emails — `worker/` directory, deploys with `wrangler`.
- [ ] **Deploy the Worker** + set `DATA.apiBase` / `DATA.stripePublicKey` — needs Cloudflare API token + Stripe keys from the operator.
- [ ] Wire Stripe: 20% deposit capture, auto-refund on outbid / below-floor. Note: Stripe keeps its processing fee on refunds — budget it or use "deposit credit" wording.
- [x] Backend for the three captured fields: bids DB (email/URL/amount), **logo file storage** (R2), outbid email alerts — scaffolded in v9 (`worker/`).
- [x] Privacy + Terms sections (v8 deploy `a879103`) — required once real deposits/emails/logos are collected.
- [x] OG/Twitter meta + favicon — the link preview is the product for a social stunt.
- [ ] Vinyl production: local die-cut vinyl studio quote (matte, residue-free), mock preview to every sponsor before printing, placement photos after.
- [ ] Empty `DATA.seed`, flip demo note off.
- [x] Deploy (GitHub Pages — live at `notghostingyou.xyz`).
- [ ] ABN + accountant sign-off on the tax model; decide business-use split if it becomes a work tool; confirm the top-up pledge's tax treatment with the accountant.
- [ ] Launch thread + pitch press; publish P&L at the end (it's the trust + marketing asset).
- [ ] Sell-out state: when all 12 spots are taken, point overflow at the Brand the Device waitlist.