(function () {
  "use strict";

  var KEY = "blt_bids_v1";
  var HIS_KEY = "blt_history_v1";
  var THEME_KEY = "blt_theme_v1";
  var CCY_KEY = "blt_ccy_v1";
  var NET = 1 - DATA.tax.rate;
  var LOGO_MAX = 256 * 1024; // bytes
  var LOGO_TYPES = ["image/svg+xml", "image/png", "image/jpeg"];
  var API = DATA.apiBase;

  /* ---------- safe storage (file:// / private mode fallback) ---------- */
  var store = (function () {
    try {
      localStorage.setItem("__t", "1");
      localStorage.removeItem("__t");
      return localStorage;
    } catch (e) {
      var mem = {};
      return {
        getItem: function (k) { return k in mem ? mem[k] : null; },
        setItem: function (k, v) { mem[k] = String(v); },
        removeItem: function (k) { delete mem[k]; },
      };
    }
  })();

  /* ---------- theme ---------- */
  var savedTheme = store.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeToggle").textContent = savedTheme === "dark" ? "☀️" : "🌙";
  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.setItem(THEME_KEY, next);
    this.textContent = next === "dark" ? "☀️" : "🌙";
  });

  /* ---------- seed state (bids + organic-looking history) ----------
     In live mode (DATA.live === true) the auction starts empty — no demo sponsors. */
  function makeSeed() {
    var bids = {};
    var hist = [];
    if (DATA.live) return { bids: bids, history: hist };
    var now = Date.now();
    DATA.seed.forEach(function (b, i) {
      bids[b.spotId] = { sponsor: b.sponsor, amount: b.draft };
      // spread seeded bids ~47 min apart so history doesn't look stamped at once
      hist.push({ spotId: b.spotId, sponsor: b.sponsor, amount: b.draft, ts: now - (DATA.seed.length - i) * 47 * 60 * 1000 });
    });
    return { bids: bids, history: hist };
  }

  /* ---------- bids ---------- */
  function load() {
    if (DATA.live) { store.setItem(KEY, "{}"); return {}; }
    var raw = store.getItem(KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* reseed */ }
    }
    var s = makeSeed();
    save(s.bids);
    return s.bids;
  }
  function save(bids) { store.setItem(KEY, JSON.stringify(bids)); }
  var bids = load();

  /* ---------- bid history ---------- */
  function loadHistory() {
    if (DATA.live) { store.setItem(HIS_KEY, "[]"); return []; }
    var raw = store.getItem(HIS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* reseed */ }
    }
    var s = makeSeed();
    store.setItem(HIS_KEY, JSON.stringify(s.history));
    return s.history;
  }
  var bidHistory = loadHistory();
  function saveHistory() { store.setItem(HIS_KEY, JSON.stringify(bidHistory)); }
  function pushHistory(spotId, sponsor, amount) {
    bidHistory.push({ spotId: spotId, sponsor: sponsor, amount: amount, ts: Date.now() });
    if (bidHistory.length > 30) bidHistory = bidHistory.slice(-30);
    saveHistory();
  }
  function countsPerSpot() {
    var map = {};
    bidHistory.forEach(function (h) { map[h.spotId] = (map[h.spotId] || 0) + 1; });
    return map;
  }

  var FX = DATA.fx.usdPerAud;
  var ccy = store.getItem(CCY_KEY) === "USD" ? "USD" : "AUD";

  function fmt(n) {
    n = Math.round(n);
    if (ccy === "USD") return "US$" + Math.round(n * FX).toLocaleString("en-US");
    return "A$" + n.toLocaleString("en-AU");
  }

  // Numeric value in the active display currency (for input min + presets — the *stored* bid is always AUD).
  function fmtVal(n) {
    n = Math.round(n);
    return ccy === "USD" ? Math.round(n * FX) : n;
  }

  function ccyLabel() { return ccy === "USD" ? "USD" : "AUD"; }
  function toAud(n) { return ccy === "USD" ? n / FX : n; }

  function syncCcyToggle() {
    var btns = document.querySelectorAll("#ccyToggle button");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-ccy") === ccy;
      btns[i].classList.toggle("on", on);
      btns[i].setAttribute("aria-pressed", String(on));
    }
    var amtLabel = document.getElementById("bidCcyLabel");
    if (amtLabel) amtLabel.textContent = "Bid amount (" + ccyLabel() + ")" + (ccy === "USD" ? " — settles in AUD" : "");
  }
  var spotById = function (id) {
    return DATA.spots.filter(function (s) { return s.id === id; })[0];
  };
  function gross() {
    var sum = 0;
    Object.keys(bids).forEach(function (id) {
      var b = bids[id];
      if (b && b.amount) sum += b.amount;
    });
    return sum;
  }

  /* ---------- lid grids (live auction ⇄ final look) ---------- */
  var VIEW_GRIDS = {
    back: document.getElementById("gridBack"),
    final: document.getElementById("gridFinal"),
  };

  function renderSpots() {
    Object.keys(VIEW_GRIDS).forEach(function (view) {
      var grid = VIEW_GRIDS[view];
      if (!grid) return;
      grid.innerHTML = "";
      DATA.spots.forEach(function (s) {
        if (s.view !== "back") return;
        var b = bids[s.id];
        var el = document.createElement("button");
        el.className = "spot" + (b ? " sold" : "") + (b && b.logo ? " has-logo" : "") + (s.w <= 4 ? " tiny" : "");
        if (s.pos) {
          el.style.left = s.pos.x + "%";
          el.style.top = s.pos.y + "%";
          el.style.width = s.pos.w + "%";
          el.style.height = s.pos.h + "%";
        }
        if (b) el.setAttribute("data-sponsor", b.sponsor);
        var img = b && b.logo ? '<img class="spot-logo" src="' + escapeHtml(b.logo) + '" alt="">' : "";
        var tgt = " · target " + fmt(s.target);
        var meta = view === "final"
          ? '<span class="cm">' + s.size + " · " + s.w + "×" + s.h + " cm" + tgt + "</span>"
          : '<span class="cm">' + s.size + " · " + s.w + "×" + s.h + " cm · " + DATA.areaOf[s.type] + " cm²" + tgt + "</span>";
        el.innerHTML =
          img +
          '<span class="price">' + fmt(s.price) + "</span>" +
          '<span class="name">' + s.name + "</span>" +
          meta;
        el.addEventListener("click", function () { openModal(s); });
        grid.appendChild(el);
      });
    });

    var legend = document.getElementById("legend");
    if (legend) {
      legend.innerHTML = "";
      var sizeMin = {};
      var legendViews = { back: true }; // size tiers are described by the main lid view
      DATA.spots.forEach(function (s) {
        if (!legendViews[s.view]) return;
        sizeMin[s.size] = sizeMin[s.size] ? Math.min(sizeMin[s.size], s.price) : s.price;
      });
      var sizeLabel = { S: "Square", M: "Banner", L: "Corner", XL: "Marquee" };
      ["XL", "L", "M", "S"].forEach(function (sz) {
        if (!sizeMin[sz]) return;
        var b = document.createElement("span");
        b.innerHTML = "<b>" + sizeLabel[sz] + "</b> · from " + fmt(sizeMin[sz]);
        legend.appendChild(b);
      });
    }
    document.getElementById("guardNote").textContent = DATA.guard;
  }

  /* ---------- carousel (live auction ⇄ final look) ---------- */
  var carousel = document.getElementById("lidCarousel");
  var carouselTrack = document.getElementById("carouselTrack");
  var slides = Array.prototype.slice.call(carouselTrack.querySelectorAll(".carousel-slide"));
  var dotsWrap = document.getElementById("carouselDots");
  var carouselIdx = 0;

  function carouselShow(i) {
    carouselIdx = (i + slides.length) % slides.length;
    slides.forEach(function (sl, k) {
      sl.classList.toggle("active", k === carouselIdx);
    });
    var dots = dotsWrap.children;
    for (var k = 0; k < dots.length; k++) {
      dots[k].classList.toggle("on", k === carouselIdx);
    }
  }

  dotsWrap.innerHTML = "";
  slides.forEach(function (sl, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.setAttribute("aria-label", "Show " + (sl.getAttribute("data-view") || i) + " view");
    d.addEventListener("click", function () { carouselShow(i); });
    dotsWrap.appendChild(d);
  });
  document.getElementById("carouselPrev").addEventListener("click", function () { carouselShow(carouselIdx - 1); });
  document.getElementById("carouselNext").addEventListener("click", function () { carouselShow(carouselIdx + 1); });
  carouselShow(0);

  /* swipe / drag support (copy promises "swipe") — pointer events cover touch + mouse */
  (function () {
    var startX = null, startY = null, tracking = false;
    function down(x, y) { startX = x; startY = y; tracking = true; }
    function up(x, y) {
      if (!tracking || startX === null) { tracking = false; return; }
      var dx = x - startX, dy = y - startY;
      tracking = false;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // not a horizontal swipe
      carouselShow(carouselIdx + (dx < 0 ? 1 : -1));
    }
    carouselTrack.addEventListener("touchstart", function (e) { var t = e.touches[0]; down(t.clientX, t.clientY); }, { passive: true });
    carouselTrack.addEventListener("touchend", function (e) { var t = e.changedTouches[0]; up(t.clientX, t.clientY); });
    carouselTrack.addEventListener("pointerdown", function (e) { down(e.clientX, e.clientY); });
    carouselTrack.addEventListener("pointerup", function (e) { up(e.clientX, e.clientY); });
    carouselTrack.addEventListener("pointercancel", function () { tracking = false; });
  })();

  /* ---------- machine + the single goal ---------- */
  function renderTiers() {
    var net = gross() * NET;
    var goal = DATA.goal;
    var covered = net >= goal.retail;
    var container = document.getElementById("tierGrid");
    container.innerHTML = "";
    var el = document.createElement("div");
    el.className = "tier" + (covered ? " active" : "");
    var cover = covered ? '<span class="covered">✓ fully covered — no top-up needed</span>' : "";
    var topup = covered
      ? '<span class="muted">Every dollar above the goal tops up what the developer keeps.</span>'
      : '<span class="muted">Shortfall below is pooled in by the developer from his own money — you still get exactly this machine.</span>';
    el.innerHTML =
      '<div class="tier-top"><span class="tier-title">' + goal.title + "</span><span class='tier-tag'>" + (covered ? "Goal reached" : "The goal") + "</span></div>" +
      '<div class="tier-sub"><span class="tier-price">' + fmt(goal.retail) + " retail</span><span>needs " + fmt(goal.grossToRaise) + " gross</span>" + cover + "</div>" +
      '<div class="tier-sub">' + topup + "</div>";
    container.appendChild(el);
    document.getElementById("taxBlurb").textContent = DATA.tax.blurb;
    document.getElementById("goalConfigPrice").textContent = "≈ " + fmt(goal.retail);
  }

  /* ---------- hero + progress (floor → single goal) ---------- */
  function renderTierBars() {
    var g = gross();
    var floor = DATA.floor;
    var goal = DATA.goal;
    var floorOk = g >= floor;

    document.getElementById("heroRaised").textContent = fmt(g);
    var badge = document.getElementById("heroBadge");
    if (!floorOk) {
      badge.textContent = fmt(floor) + " minimum";
      badge.className = "badge wait";
    } else if (g >= goal.grossToRaise) {
      badge.textContent = "Goal reached";
      badge.className = "badge";
    } else {
      badge.textContent = "Floor passed — dev tops up the rest";
      badge.className = "badge";
    }

    var rows = document.getElementById("tierRows");
    rows.innerHTML = "";
    var bars = [
      { level: "Floor", title: "go / no-go", gross: floor },
      { level: "Goal", title: goal.title, gross: goal.grossToRaise },
    ];
    var active = null;
    var prevOk = true;
    bars.forEach(function (b) {
      var passed = g >= b.gross;
      var pct = passed ? 100 : (prevOk ? Math.min(100, (g / b.gross) * 100) : 0);
      if (!passed && prevOk && !active) active = b;
      prevOk = prevOk && passed;
      var row = document.createElement("div");
      row.className = "tbar" + (passed ? " done" : "");
      var mark = passed ? "✓" : Math.round(pct) + "%";
      var sub = passed
        ? (b.level === "Floor" ? "floor reached" : "goal reached")
        : fmt(g) + " of " + fmt(b.gross);
      row.innerHTML =
        '<div class="tbar-top"><span class="tbar-name">' + b.level + " · " + b.title + '</span><span class="tbar-goal">' + fmt(b.gross) + " gross</span></div>" +
        '<div class="bar"><div class="bar-fill target" style="width:' + pct.toFixed(1) + '%"></div></div>' +
        '<div class="tbar-mark"><span class="mark">' + mark + "</span><span class='muted'>" + sub + "</span></div>";
      rows.appendChild(row);
    });

    var net = g * NET;
    var label;
    if (!floorOk) {
      label = "Raised " + fmt(g) + " gross so far — " + fmt(floor - g) + " to the " + fmt(floor) + " floor. Below it, every deposit is refunded in full.";
    } else if (g >= goal.grossToRaise) {
      label = "Goal reached — after ~32.5% tax that's ≈ " + fmt(net) + ", enough for the " + goal.title + " config. The lid is happening.";
    } else {
      label = "Floor passed — raised " + fmt(g) + " gross toward " + fmt(goal.grossToRaise) + ". After ~32.5% tax that's ≈ " + fmt(net) + ". The " + fmt(goal.retail - net) + " shortfall is pooled in by the developer from his own money — you still get exactly this machine.";
    }
    document.getElementById("progressLabel").textContent = label;
    document.getElementById("stretchNote").textContent =
      active ? "Bars fill one at a time — the goal fills next." : DATA.stretch;
  }

  /* ---------- countdown ---------- */
  var countdownTimer = null;
  function tick() {
    var el = document.getElementById("countdown");
    var diff = new Date(DATA.closing).getTime() - Date.now();
    if (diff <= 0) {
      el.innerHTML = "Final look logged below. The auction has closed.";
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      return;
    }
    var d = Math.floor(diff / 864e5);
    var h = Math.floor(diff / 36e5) % 24;
    var m = Math.floor(diff / 6e4) % 60;
    var s = Math.floor(diff / 1e3) % 60;
    var parts = [];
    if (d) parts.push(d + "d");
    if (h) parts.push(h + "h");
    if (m) parts.push(m + "m");
    parts.push(s + "s");
    el.innerHTML = "Auction closes in <b>" + parts.join(" ") + "</b> — get your bid in before it's snapped.";
  }

  /* ---------- hero activity ticker ---------- */
  function ago(ts) {
    var mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (mins < 60) return mins + "m ago";
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.round(hrs / 24) + "d ago";
  }
  function renderTicker() {
    var el = document.getElementById("ticker");
    if (!el) return;
    if (!bidHistory.length) { el.innerHTML = ""; return; }
    var h = bidHistory[bidHistory.length - 1];
    var s = spotById(h.spotId);
    el.innerHTML = "Latest: <b>" + escapeHtml(h.sponsor) + "</b> bid <b>" + fmt(h.amount) + "</b> on " +
      escapeHtml(s ? s.name : h.spotId) + ' <span class="muted">· ' + ago(h.ts) + "</span>";
  }

  /* ---------- spot list (auction) ---------- */
  function renderBids() {
    var rows = document.getElementById("bidRows");
    rows.innerHTML = "";
    var counts = countsPerSpot();
    DATA.spots.forEach(function (s) {
      var b = bids[s.id];
      var el = document.createElement("div");
      el.className = "sl-row";
      var dims = s.size + " · " + s.w + "×" + s.h + " cm · " + DATA.areaOf[s.type] + " cm² · target " + fmt(s.target);
      var bidHtml;
      if (b) {
        var nameHtml = b.url
          ? '<a href="' + escapeHtml(b.url) + '" target="_blank" rel="noopener">' + escapeHtml(b.sponsor) + "</a>"
          : escapeHtml(b.sponsor);
        var logoHtml = b.logo ? '<img class="sl-logo" loading="lazy" src="' + escapeHtml(b.logo) + '" alt="">' : "";
        bidHtml = fmt(b.amount) + "<small>" + logoHtml + nameHtml +
          ' <span class="sl-count">· ' + (counts[s.id] || 1) + " bid" + ((counts[s.id] || 1) === 1 ? "" : "s") + "</span></small>";
      } else {
        bidHtml = 'Open for bids<small>no bid yet</small>';
      }
      el.innerHTML =
        '<div class="sl-spot">' + escapeHtml(s.name) + "<small>" + dims + "</small></div>" +
        '<span class="sl-size">' + fmt(s.price) + " start</span>" +
        '<div class="sl-bid">' + bidHtml + "</div>";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sl-cta";
      btn.textContent = b ? "Outbid" : "Bid";
      btn.addEventListener("click", function () { openModal(s); });
      el.appendChild(btn);
      rows.appendChild(el);
    });
    var gridTotal = DATA.spots.reduce(function (a, s) { return a + s.price; }, 0);
    document.getElementById("bidSummary").textContent =
      "Grid value if every spot sells at base: " + fmt(gridTotal) +
      " · current bids: " + fmt(gross()) + " gross → ≈ " + fmt(gross() * NET) + " to spend.";
    renderHistory();
    renderTicker();
  }

  function renderHistory() {
    var row = document.getElementById("historyRows");
    row.innerHTML = "";
    if (!bidHistory.length) { row.innerHTML = '<span class="muted">No bids logged yet.</span>'; }
    bidHistory.slice().reverse().forEach(function (h) {
      var s = spotById(h.spotId);
      var el = document.createElement("div");
      el.className = "hrow";
      el.innerHTML =
        '<span class="hspot">' + escapeHtml(s ? s.name : h.spotId) + "</span>" +
        '<span class="muted">' + escapeHtml(h.sponsor) + "</span>" +
        '<span class="hval">' + fmt(h.amount) + "</span>" +
        '<span class="hts">' + new Date(h.ts).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + "</span>";
      row.appendChild(el);
    });
    document.getElementById("historyCount").textContent = "· " + bidHistory.length + " bids";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- modal ---------- */
  var activeSpot = null;
  var modal = document.getElementById("bid-modal-wrapper");
  var logoData = null; // validated dataURL waiting to be submitted

  function openModal(spot) {
    activeSpot = spot;
    logoData = null;
    var b = bids[spot.id];
    var minBid = b && b.amount ? b.amount + 10 : spot.price;
    document.getElementById("modalSizeTag").textContent =
      "Size " + spot.size + " · " + spot.w + "×" + spot.h + " cm · " + DATA.areaOf[spot.type] + " cm²";
    document.getElementById("modalSpotTitle").textContent = spot.name;
    document.getElementById("modalSpotBlurb").textContent =
      DATA.blurb[spot.type] + " Starting price " + fmt(spot.price) +
      ", minimum to take it now: " + fmt(minBid) + ".";
    document.getElementById("bidSponsor").value = "";
    document.getElementById("bidAmount").value = "";
    document.getElementById("bidAmount").min = fmtVal(minBid);
    document.getElementById("bidEmail").value = "";
    document.getElementById("bidUrl").value = "";
    document.getElementById("bidLogo").value = "";
    var agree = document.getElementById("bidAgree");
    if (agree) agree.checked = false;
    var preview = document.getElementById("logoPreview");
    preview.classList.add("hidden");
    preview.removeAttribute("src");

    var presets = document.getElementById("presets");
    presets.innerHTML = "";
    // Every chip is a valid bid: derive from the minimum, never below it.
    var chips = [minBid, minBid + 100, spot.price * 2, 1000]
      .filter(function (v) { return v >= minBid; })
      .filter(function (v, i, arr) { return arr.indexOf(v) === i; })
      .slice(0, 4);
    chips.forEach(function (v, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset";
      btn.textContent = (i === 0 ? "Min " : "Bid ") + fmt(v);
      btn.addEventListener("click", function () { document.getElementById("bidAmount").value = fmtVal(v); });
      presets.appendChild(btn);
    });

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("bidSponsor").focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    activeSpot = null;
    logoData = null;
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); return; }
    // basic focus trap while the bid modal is open
    if (e.key === "Tab" && !modal.classList.contains("hidden")) {
      var f = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* logo upload — validate + preview as it will sit on the lid */
  document.getElementById("bidLogo").addEventListener("change", function () {
    var file = this.files && this.files[0];
    var preview = document.getElementById("logoPreview");
    logoData = null;
    preview.classList.add("hidden");
    if (!file) return;
    var okType = LOGO_TYPES.indexOf(file.type) !== -1 || /\.(svg|png|jpe?g)$/i.test(file.name);
    if (!okType) {
      alert("Logo must be SVG, PNG, or JPG — it becomes a die-cut vinyl sticker.");
      this.value = "";
      return;
    }
    if (file.size > LOGO_MAX) {
      alert("Logo file is too large (" + Math.ceil(LOGO_MAX / 1024) + " KB max). Use a vector SVG or a compressed PNG.");
      this.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      logoData = reader.result;
      preview.src = logoData;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  (function () {
    var submitBtn = document.getElementById("bidSubmit");
    var note = submitBtn ? submitBtn.nextElementSibling : null;
    if (DATA.stripePublicKey && submitBtn) {
      submitBtn.textContent = "Place bid — pay 20% deposit";
      if (note) note.textContent = "You'll be charged a 20% refundable deposit. The founder refunds it in full if you're outbid; otherwise it counts toward your total.";
    }
  })();
  document.getElementById("bidSubmit").addEventListener("click", function () {
    if (!activeSpot) return;
    var sponsor = document.getElementById("bidSponsor").value.trim();
    var rawAmount = document.getElementById("bidAmount").value.trim();
    var email = document.getElementById("bidEmail").value.trim();
    var url = document.getElementById("bidUrl").value.trim();
    if (!sponsor) { alert("Enter a sponsor / company name."); return; }
    var agree = document.getElementById("bidAgree");
    if (agree && !agree.checked) { alert("Please agree to the Terms and Privacy policy to place a bid."); return; }
    var parsed = parseFloat(rawAmount);
    if (!/^\d+([.,]\d+)?$/.test(rawAmount)) { alert("Enter a bid amount."); return; }
    var amount = Math.round(toAud(parsed)); // always settle in AUD
    if (!amount || isNaN(amount)) { alert("Enter a bid amount."); return; }
    var current = bids[activeSpot.id];
    var minBid = current && current.amount ? current.amount + 10 : activeSpot.price;
    if (amount < minBid) {
      alert("Minimum bid on this spot is " + fmt(minBid) + " (outbids must beat the current top bid).");
      return;
    }
    if (!/.+@.+\..+/.test(email)) { alert("Enter a valid email — outbid alerts and the payment link go there."); return; }
    if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
    if (url && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(url)) { alert("That website doesn't look right — use something like company.com."); return; }
    // No logo, no bid: the file is what becomes the sticker on the lid.
    if (!logoData) { alert("Upload your logo — it's the file that becomes the vinyl sticker on this spot."); return; }

    if (API) {
      var spot = activeSpot;
      var btn = document.getElementById("bidSubmit");
      btn.disabled = true; btn.textContent = "Placing bid…";
      fetch(API + "/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId: spot.id, sponsor: sponsor, amount: amount, email: email, url: url || null, logo: logoData }),
      }).then(function (r) { return r.json(); }).then(function (res) {
        btn.disabled = false;
        if (res.error) { btn.textContent = "Place bid — pay 20% deposit"; alert(res.error); return; }
        closeModal();
        if (DATA.stripePublicKey && res.bidderId && res.status === "pending") {
          btn.textContent = "Redirecting to deposit…";
          fetch(API + "/deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount, spotId: spot.id, sponsor: sponsor, email: email, bidderId: res.bidderId }),
          }).then(function (r) { return r.json(); }).then(function (dep) {
            if (dep.checkoutUrl) window.location.href = dep.checkoutUrl;
            else {
              btn.textContent = "Place bid — pay 20% deposit";
              alert(dep.error
                ? "Bid placed, but the deposit step failed: " + dep.error + " Reopen the spot to retry payment."
                : "Bid placed, but the deposit link wasn't created. Reopen the spot to retry payment.");
            }
          }).catch(function () { btn.textContent = "Place bid — pay 20% deposit"; });
        } else {
          btn.textContent = "Place bid — pay 20% deposit";
          refreshFromApi();
        }
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = "Place bid — pay 20% deposit";
        alert("Couldn't reach the auction server — check your connection and try again.");
      });
      return;
    }

    bids[activeSpot.id] = { sponsor: sponsor, amount: amount, email: email, url: url || null, logo: logoData };
    save(bids);
    pushHistory(activeSpot.id, sponsor, amount);
    closeModal();
    renderSpots(); renderTiers(); renderTierBars(); renderBids();
  });

  /* waitlist */
  var wl = document.getElementById("waitlist");
  if (wl) {
    wl.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("waitlistEmail").value.trim();
      var note = document.getElementById("waitlistNote");
      if (!email) { note.textContent = "Drop an email above and you're in."; return; }
      if (API) {
        fetch(API + "/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }).then(function (r) { return r.json(); }).then(function (res) {
          note.textContent = res.error ? res.error : "You're on the list — notified at launch.";
          note.style.color = res.error ? "var(--red)" : "var(--green)";
        }).catch(function () {
          note.textContent = "Couldn't reach the server — try again in a moment.";
          note.style.color = "var(--red)";
        });
      } else {
        note.textContent = "Thanks! " + email + " is on the list — we'll notify you at launch.";
        note.style.color = "var(--green)";
      }
    });
  }

  /* owner link */
  var ownerLink = document.getElementById("ownerLink");
  if (ownerLink && DATA.ownerLink) ownerLink.href = DATA.ownerLink;

  var resetBtn = document.getElementById("resetBids");
  if (resetBtn) {
    if (DATA.live) { resetBtn.style.display = "none"; }
    else {
      resetBtn.addEventListener("click", function () {
        if (!confirm("Reset demo bids and history back to the seeded state?")) return;
        var s = makeSeed();
        bids = s.bids;
        save(bids);
        bidHistory = s.history;
        saveHistory();
        renderSpots(); renderTiers(); renderTierBars(); renderBids();
      });
    }
  }

  /* ---------- currency view (display-only; real deposits settle in AUD) ---------- */
  function setCcy(code) {
    ccy = code;
    store.setItem(CCY_KEY, code);
    if (document.getElementById("bidAmount")) {
      document.getElementById("bidAmount").value = "";
    }
    syncCcyToggle();
    renderSpots(); renderTiers(); renderTierBars(); renderBids();
  }
  document.getElementById("ccyToggle").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-ccy]");
    if (!btn || btn.getAttribute("data-ccy") === ccy) return;
    setCcy(btn.getAttribute("data-ccy"));
  });
  syncCcyToggle();

  tick();
  countdownTimer = setInterval(tick, 1000);
  // keep the "Xm ago" ticker honest without a full re-render every second
  setInterval(renderTicker, 60000);
  renderSpots(); renderTiers(); renderTierBars(); renderBids();

  /* ---------- live backend boot (when DATA.apiBase is set) ---------- */
  var logoCache = {};  // spotId → data URL (cached after first fetch)

  async function fetchLogo(spotId) {
    if (logoCache[spotId]) return logoCache[spotId];
    try {
      var res = await fetch(API + "/logo/" + spotId);
      if (res.ok) {
        var dataUrl = await res.text();
        logoCache[spotId] = dataUrl;
        return dataUrl;
      }
    } catch (e) {}
    return null;
  }

  async function mergeLogos(freshBids) {
    var keys = Object.keys(freshBids || {});
    var promises = keys.filter(function (k) {
      return freshBids[k].hasLogo && !logoCache[k];
    }).map(function (k) {
      return fetchLogo(k).then(function (logo) {
        if (logo) freshBids[k].logo = logo;
      });
    });
    await Promise.all(promises);
    keys.forEach(function (k) {
      if (logoCache[k] && !freshBids[k].logo) freshBids[k].logo = logoCache[k];
    });
    return freshBids;
  }

  async function refreshFromApi() {
    try {
      var [bRes, hRes] = await Promise.all([
        fetch(API + "/bids").then(function (r) { return r.json(); }),
        fetch(API + "/history").then(function (r) { return r.json(); }),
      ]);
      bids = await mergeLogos(bRes || {});
      bidHistory = (hRes || []).map(function (h) {
        return { spotId: h.spot_id, sponsor: h.sponsor, amount: h.amount, ts: Date.parse(h.ts) };
      }).reverse().slice(-30);
      renderSpots(); renderTiers(); renderTierBars(); renderBids();
    } catch (e) {
      var fb = document.getElementById("ticker");
      if (fb) fb.textContent = "Live bids loading — refresh in a moment.";
    }
  }

  // On page load, check for Stripe redirect params
  (function () {
    var params = new URLSearchParams(window.location.search);
    var depositStatus = params.get("deposit");
    var spotId = params.get("spot");
    var bidderId = params.get("bidder");
    if (depositStatus === "ok" && spotId && bidderId) {
      fetch(API + "/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId: spotId, bidderId: bidderId }),
      }).then(function (r) { return r.json(); }).then(function (res) {
        var note = document.getElementById("ticker");
        if (note) {
          if (res.ok) note.innerHTML = "✓ Deposit received — your bid on <b>" + spotId + "</b> is now live.";
          else note.innerHTML = "Deposit confirmation issue: " + (res.error || "unknown") + ". Your bid may still be processing.";
        }
        refreshFromApi();
      }).catch(function () {
        refreshFromApi();
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (depositStatus === "cancel") {
      var cn = document.getElementById("ticker");
      if (cn) cn.textContent = "Deposit cancelled — your bid was not placed. Try again when ready.";
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  })();

  if (API) refreshFromApi();
  if (API) setInterval(function () {
    fetch(API + "/bids").then(function (r) { return r.json(); }).then(function (fresh) {
      var sig = function (b) { return Object.keys(b || {}).map(function (k) { return k + ":" + (b[k] && b[k].amount); }).join("|"); };
      if (sig(fresh) !== sig(bids)) {
        mergeLogos(fresh).then(function (merged) {
          bids = merged;
          fetch(API + "/history").then(function (r) { return r.json(); }).then(function (hRes) {
            bidHistory = (hRes || []).map(function (h) {
              return { spotId: h.spot_id, sponsor: h.sponsor, amount: h.amount, ts: Date.parse(h.ts) };
            }).reverse().slice(-30);
            renderSpots(); renderTiers(); renderTierBars(); renderBids();
          }).catch(function () {
            renderSpots(); renderTiers(); renderTierBars(); renderBids();
          });
        });
      }
    }).catch(function () {});
  }, 30000);
})();
