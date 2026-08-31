"use strict";

const DATA = {
  brand: "Brand the Device",
  currency: "AUD",
  display: "A$",
  // USD view is display-only; all bids settle in AUD. ~0.71 mid-market (2026-08).
  fx: { usdPerAud: 0.71 },
  ownerName: "Vansh",
  ownerLink: "https://x.com/vanshuETH",  // human's real handle

  // Backend seam — set these at launch to go live (null = local demo mode):
  //   apiBase:          e.g. "https://notghostingyou-api.workers.dev"
  //                     (serves: GET /bids, GET /history, POST /bid, POST /logo)
  //   stripePublicKey:  Stripe publishable key — turns the button into a real
  //                     20% refundable deposit checkout instead of a demo bid.
  apiBase: "https://notghostingyou-api.vanshkhanna416.workers.dev",
  stripePublicKey: "pk_test_51UA1WNHMepf4cgbYy2mrDGafo9rB5BZ1RamPvqrKSWkiLWSuy0BY2FN3e3LrneU8hsWqY3ueTn2xlt3TvdXhjw0j00ORy68eLH",

  // Auction close (used for the countdown). ISO string.
  closing: "2026-09-30T20:00:00Z",

  // Tax note — stated plainly.
  tax: {
    rate: 0.325,
    blurb: "About 32.5% of everything raised goes to Australian income tax before I buy anything, so the config price is covered by a bigger gross figure — printed next to the goal so there's no mystery.",
  },

  // The ONE fixed goal — no tiers. If the raise falls short, the developer
  // tops up the difference from his own money, so the lid is always this exact
  // machine: M5 Pro, 64GB / 2TB.
  // RRP = A$7,049 (AU retail, 16-inch M5 Pro 18-core/20-core, Silver).
  // grossToRaise = retail ÷ (1 − tax) = retail ÷ 0.675.
  floor: 3740, // go / no-go — full refund below this, no Mac.
  goal: {
    title: "64GB · 2TB · M5 Pro",
    retail: 7049,
    grossToRaise: 10443, // retail ÷ (1 − 0.325 tax) ≈ 10,443, rounded to the sum of per-spot max-tier targets
  },
  topup: "One fixed config — no lesser laptop, ever. If the raise comes up short, the developer pools in the difference from his own money so the machine is exactly the one promised — and it becomes his everyday travel laptop.",
  stretch: "Every dollar above the goal tops up what the developer keeps — and the more it raises, the further this laptop travels.",

  // 8 spots laid out on the real MacBook Pro 16" lid (35.57 × 24.81 cm).
  // Usable area (1.5cm margin) ≈ 710cm² — spots fill ~60% with a premium
  // hierarchy and the Apple logo protected at center. Standard shapes:
  //   Corner (8×6cm) — 4, the affordable entry tier
  //   Banner (16.5×5cm) — Marquee above the logo, South below it
  //   Flank  (6×6cm)  — West & East, right beside the logo
  // Positions are % of the lid, derived from real cm coordinates.
  // Price/cm² is monotonic (banners highest, corners lowest).
  // Base grid A$6,040 (crosses the A$3,740 floor). Targets sum to exactly
  // A$10,443 — the gross needed to fund the machine after 32.5% tax.
  spots: [
    // --- corner squares (affordable entry tier) ---
    { id: "tl", view: "back", type: "big", col: 1, span: 1, row: 1, rowspan: 1, price: 550, target: 950, w: 8, h: 6, size: "L", name: "Top left corner", pos: { x: 4.2, y: 6.0, w: 22.5, h: 24.2 } },
    { id: "tr", view: "back", type: "big", col: 5, span: 1, row: 1, rowspan: 1, price: 550, target: 950, w: 8, h: 6, size: "L", name: "Top right corner", pos: { x: 73.1, y: 6.0, w: 22.5, h: 24.2 } },
    { id: "bl", view: "back", type: "big", col: 1, span: 1, row: 5, rowspan: 1, price: 520, target: 900, w: 8, h: 6, size: "L", name: "Bottom left corner", pos: { x: 4.2, y: 66.5, w: 22.5, h: 24.2 } },
    { id: "br", view: "back", type: "big", col: 5, span: 1, row: 5, rowspan: 1, price: 520, target: 900, w: 8, h: 6, size: "L", name: "Bottom right corner", pos: { x: 73.1, y: 66.5, w: 22.5, h: 24.2 } },
    // --- banners: Marquee above, South below ---
    { id: "marquee", view: "back", type: "marquee", col: 3, span: 2, row: 1, rowspan: 1, price: 1600, target: 2763, w: 16.5, h: 5, size: "XL", name: "Marquee — above the Apple logo", pos: { x: 26.7, y: 5.2, w: 46.4, h: 20.2 } },
    { id: "s", view: "back", type: "snipe", col: 3, span: 2, row: 5, rowspan: 1, price: 1300, target: 2250, w: 16.5, h: 5, size: "M", name: "South — under the Apple logo", pos: { x: 26.7, y: 66.9, w: 46.4, h: 20.2 } },
    // --- flanks: West & East ---
    { id: "w", view: "back", type: "flank", col: 1, span: 1, row: 3, rowspan: 2, price: 500, target: 865, w: 6, h: 6, size: "L", name: "West — left of the Apple logo", pos: { x: 27.6, y: 34.3, w: 16.9, h: 24.2 } },
    { id: "e", view: "back", type: "flank", col: 5, span: 1, row: 3, rowspan: 2, price: 500, target: 865, w: 6, h: 6, size: "L", name: "East — right of the Apple logo", pos: { x: 58.5, y: 34.3, w: 16.9, h: 24.2 } },
  ],

  areaOf: { big: 48, marquee: 82.5, snipe: 82.5, flank: 36 },

    blurb: {
      big: "The frame. A big corner square that anchors the whole lid — the first thing the eye lands on when the lid opens.",
      marquee: "The crown. Dead center above the Apple logo — the loudest, most photographed spot on the lid.",
      snipe: "The closer. The wide banner below the Apple logo — the last thing people read before they look up at you.",
      flank: "Right beside the Apple. A square strip that hugs the world's most recognised mark — in every shot that gets posted.",
    },

  guard: "The Apple logo is left exactly as Apple ships it — exclusive and untouched. Nothing is ever placed on it.",

  // LIVE MODE: true = auction starts EMPTY — A$0 raised, all 8 spots open, no
  // demo sponsors. This is the real "nothing raised yet" state. Flip back to
  // false only to preview the seeded demo data on a prototype.
  live: true,

  // Demo seed: gross ≈ A$6,400 — past the A$3,740 floor, tracking toward
  // the A$10,443 target; the developer tops up any shortfall. Some of the 8
  // spots sold; the rest stay open.
  // (Ignored entirely when DATA.live === true.)
  seed: [
    { spotId: "marquee", draft: 3600, sponsor: "Panthrex" },
    { spotId: "w",       draft: 1150, sponsor: "Orbitdesk" },
    { spotId: "e",       draft: 1300, sponsor: "Pixelpress" },
    { spotId: "s",       draft: 1000, sponsor: "KernelKraft" },
    { spotId: "nw-a",    draft: 480,  sponsor: "Dune Labs" },
    { spotId: "nw-b",    draft: 450,  sponsor: "Junoire" },
    { spotId: "ne-b",    draft: 430,  sponsor: "Brightway" },
    { spotId: "sw-a",    draft: 390,  sponsor: "Mistral Ink" },
    { spotId: "se-a",    draft: 400,  sponsor: "Nimbus" },
    { spotId: "se-b",    draft: 360,  sponsor: "Arcline" },
  ],
};