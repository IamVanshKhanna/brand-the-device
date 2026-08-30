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
  // machine: M5 Max, 128GB / 2TB, nano-texture.
  // RRP ≈ A$11,224 (apple.com/au, 16-inch M5 Max 18-core/40-core, Silver,
  // nano-texture). grossToRaise = retail ÷ (1 − tax) = retail ÷ 0.675.
  floor: 6000, // go / no-go — full refund below this, no Mac.
  goal: {
    title: "128GB · 2TB · nano-texture",
    retail: 11224,
    grossToRaise: 16640, // retail ÷ (1 − 0.325 tax) ≈ 16,628, rounded to the sum of per-spot max-tier targets
  },
  topup: "One fixed config — no lesser laptop, ever. If the raise comes up short, the developer pools in the difference from his own money so the machine is exactly the one promised — and it becomes his everyday travel laptop.",
  stretch: "Every dollar above the goal tops up what the developer keeps — and the more it raises, the further this laptop travels.",

  // 14 spots — big corners frame the lid, small pads fill every gap around the
  // Apple logo. Fully symmetric (mirrors left/right and top/bottom):
  //   Big   (8×7cm)  — 4 corner banners, the premium real estate
  //   Crown (14×5cm) — Marquee above the logo, South below it
  //   Flank (6×9cm)  — West & East, right beside the logo
  //   Pad   (4×3cm)  — 6 small pads hugging the logo & filling the gaps
  // Price ladder: accessible entry (Pads A$200-250) → premium (Marquee A$1,400).
  // Base grid A$7,800 (above A$6,000 floor). Targets sum to exactly A$16,640 —
  // the gross needed to fund the machine after 32.5% tax.
  spots: [
    // --- big corner banners ---
    { id: "tl", view: "back", type: "big", col: 1, span: 1, row: 1, rowspan: 1, price: 700, target: 1400, w: 8, h: 7, size: "L", name: "Top left corner — big", pos: { x: 2, y: 3, w: 25, h: 27 } },
    { id: "tr", view: "back", type: "big", col: 5, span: 1, row: 1, rowspan: 1, price: 700, target: 1400, w: 8, h: 7, size: "L", name: "Top right corner — big", pos: { x: 73, y: 3, w: 25, h: 27 } },
    { id: "bl", view: "back", type: "big", col: 1, span: 1, row: 5, rowspan: 1, price: 600, target: 1200, w: 8, h: 7, size: "L", name: "Bottom left corner — big", pos: { x: 2, y: 70, w: 25, h: 27 } },
    { id: "br", view: "back", type: "big", col: 5, span: 1, row: 5, rowspan: 1, price: 600, target: 1200, w: 8, h: 7, size: "L", name: "Bottom right corner — big", pos: { x: 73, y: 70, w: 25, h: 27 } },
    // --- directional: Marquee above, South below ---
    { id: "marquee", view: "back", type: "marquee", col: 3, span: 2, row: 1, rowspan: 1, price: 1400, target: 3240, w: 14, h: 5, size: "XL", name: "Marquee — above the Apple logo", pos: { x: 30, y: 3, w: 40, h: 26 } },
    { id: "s", view: "back", type: "snipe", col: 3, span: 2, row: 5, rowspan: 1, price: 900, target: 2000, w: 14, h: 4, size: "M", name: "South — under the Apple logo", pos: { x: 30, y: 71, w: 40, h: 26 } },
    // --- directional: West & East flanks ---
    { id: "w", view: "back", type: "flank", col: 1, span: 1, row: 3, rowspan: 2, price: 800, target: 1700, w: 6, h: 9, size: "L", name: "West — left of the Apple logo", pos: { x: 2, y: 33, w: 25, h: 34 } },
    { id: "e", view: "back", type: "flank", col: 5, span: 1, row: 3, rowspan: 2, price: 800, target: 1700, w: 6, h: 9, size: "L", name: "East — right of the Apple logo", pos: { x: 73, y: 33, w: 25, h: 34 } },
    // --- small pads hugging the Apple logo ---
    { id: "nw-a", view: "back", type: "mid", col: 3, span: 1, row: 2, rowspan: 1, price: 200, target: 450, w: 4, h: 3, size: "S", name: "Pad — above the logo, left", pos: { x: 29, y: 30, w: 15, h: 7 } },
    { id: "ne-a", view: "back", type: "mid", col: 4, span: 1, row: 2, rowspan: 1, price: 200, target: 450, w: 4, h: 3, size: "S", name: "Pad — above the logo, right", pos: { x: 56, y: 30, w: 15, h: 7 } },
    { id: "nw-b", view: "back", type: "mid", col: 3, span: 1, row: 3, rowspan: 1, price: 250, target: 500, w: 4, h: 3, size: "S", name: "Pad — left of the logo", pos: { x: 29, y: 38, w: 15, h: 17 } },
    { id: "ne-b", view: "back", type: "mid", col: 4, span: 1, row: 3, rowspan: 1, price: 250, target: 500, w: 4, h: 3, size: "S", name: "Pad — right of the logo", pos: { x: 56, y: 38, w: 15, h: 17 } },
    { id: "sw-a", view: "back", type: "mid", col: 3, span: 1, row: 4, rowspan: 1, price: 200, target: 450, w: 4, h: 3, size: "S", name: "Pad — below the logo, left", pos: { x: 29, y: 63, w: 15, h: 7 } },
    { id: "se-a", view: "back", type: "mid", col: 4, span: 1, row: 4, rowspan: 1, price: 200, target: 450, w: 4, h: 3, size: "S", name: "Pad — below the logo, right", pos: { x: 56, y: 63, w: 15, h: 7 } },
  ],

  areaOf: { big: 56, marquee: 70, snipe: 56, flank: 54, mid: 12 },

    blurb: {
      big: "The frame. A big corner banner that anchors the whole lid — the first thing the eye lands on when the lid opens.",
      marquee: "The crown. Dead center above the Apple logo — the loudest, most photographed spot on the lid.",
      snipe: "The closer. The wide banner below the Apple logo — the last thing people read before they look up at you.",
      flank: "Right beside the Apple. A tall strip that hugs the world's most recognised mark — in every shot that gets posted.",
      mid: "The detail. A compact pad tucked against the Apple logo — big enough to read, cheap enough to grab.",
    },

  guard: "The Apple logo is left exactly as Apple ships it — exclusive and untouched. Nothing is ever placed on it.",

  // LIVE MODE: true = auction starts EMPTY — A$0 raised, all 14 spots open, no
  // demo sponsors. This is the real "nothing raised yet" state. Flip back to
  // false only to preview the seeded demo data on a prototype.
  live: true,

  // Demo seed: gross ≈ A$9,560 — past the A$6,000 floor, tracking toward
  // the A$16,640 target; the developer tops up any shortfall. Some of the 14
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