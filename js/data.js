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
  apiBase: null,
  stripePublicKey: null,

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

  // 12 spots on a 3×3 sector layout of the lid: the four directional spots
  // (N / E / S / W) are the big ones; each corner splits into two 4×4 cm
  // squares; the center cell is the Apple logo's guard ring. Base grid
  // totals exactly A$6,000 = the floor: sell every spot at base and the
  // go/no-go floor is crossed; outbids climb toward the fixed goal.
  spots: [
    // --- top row: left corner squares, N banner, right corner squares ---
    { id: "nw-a",  view: "back", type: "mini", col: 1, span: 1, row: 1, rowspan: 2, price: 400, target: 1010, w: 4, h: 4, size: "S", name: "Top left — square 1", pos: { x: 3, y: 3, w: 11.24, h: 16.62 } },
    { id: "nw-b",  view: "back", type: "mini", col: 2, span: 1, row: 1, rowspan: 2, price: 350, target: 880, w: 4, h: 4, size: "S", name: "Top left — square 2", pos: { x: 15.24, y: 3, w: 11.24, h: 16.62 } },
    { id: "marquee", view: "back", type: "marquee", col: 3, span: 2, row: 1, rowspan: 2, price: 1200, target: 3020, w: 14, h: 6, size: "L", name: "Marquee — above the Apple logo", pos: { x: 30.33, y: 3, w: 39.35, h: 24.94 } },
    { id: "ne-a",  view: "back", type: "mini", col: 5, span: 1, row: 1, rowspan: 2, price: 350, target: 880, w: 4, h: 4, size: "S", name: "Top right — square 1", pos: { x: 73.52, y: 3, w: 11.24, h: 16.62 } },
    { id: "ne-b",  view: "back", type: "mini", col: 6, span: 1, row: 1, rowspan: 2, price: 400, target: 1010, w: 4, h: 4, size: "S", name: "Top right — square 2", pos: { x: 85.76, y: 3, w: 11.24, h: 16.62 } },
    // --- middle row: W strip, [Apple logo guard], E strip ---
    { id: "w", view: "back", type: "flank", col: 1, span: 2, row: 3, rowspan: 2, price: 1000, target: 2520, w: 8, h: 9, size: "L", name: "West — left of the Apple logo", pos: { x: 3, y: 30.8, w: 22.49, h: 37.4 } },
    { id: "e", view: "back", type: "flank", col: 5, span: 2, row: 3, rowspan: 2, price: 1000, target: 2520, w: 8, h: 9, size: "L", name: "East — right of the Apple logo", pos: { x: 74.51, y: 30.8, w: 22.49, h: 37.4 } },
    // --- bottom row: left corner squares, S banner, right corner squares ---
    { id: "sw-a",  view: "back", type: "mini", col: 1, span: 1, row: 5, rowspan: 2, price: 300, target: 760, w: 4, h: 4, size: "S", name: "Bottom left — square 1", pos: { x: 3, y: 80.38, w: 11.24, h: 16.62 } },
    { id: "sw-b",  view: "back", type: "mini", col: 2, span: 1, row: 5, rowspan: 2, price: 250, target: 630, w: 4, h: 4, size: "S", name: "Bottom left — square 2", pos: { x: 15.24, y: 80.38, w: 11.24, h: 16.62 } },
    { id: "s",     view: "back", type: "snipe", col: 3, span: 2, row: 5, rowspan: 2, price: 800, target: 2020, w: 14, h: 5, size: "M", name: "South — under the Apple logo", pos: { x: 30.33, y: 76.22, w: 39.35, h: 20.78 } },
    { id: "se-a",  view: "back", type: "mini", col: 5, span: 1, row: 5, rowspan: 2, price: 250, target: 630, w: 4, h: 4, size: "S", name: "Bottom right — square 1", pos: { x: 73.52, y: 80.38, w: 11.24, h: 16.62 } },
    { id: "se-b",  view: "back", type: "mini", col: 6, span: 1, row: 5, rowspan: 2, price: 300, target: 760, w: 4, h: 4, size: "S", name: "Bottom right — square 2", pos: { x: 85.76, y: 80.38, w: 11.24, h: 16.62 } },
  ],

  areaOf: { marquee: 84, flank: 72, snipe: 70, mini: 16 },

    blurb: {
      marquee: "The big one above the Apple logo — the loudest spot on a 16-inch lid, and the one most often in frame on the road.",
      flank: "Full-tall edge strip along the side, right beside the Apple logo — catches the eye in every cafe and terminal.",
      snipe: "The wide bottom banner — the part people actually read first in a café.",
      mini: "Compact 4×4 cm corner square — two per corner. Great for tight, simple logos.",
    },

  guard: "The Apple logo is left exactly as Apple ships it — exclusive and untouched. Nothing is ever placed on it.",

  // LIVE MODE: true = auction starts EMPTY — A$0 raised, all 12 spots open, no
  // demo sponsors. This is the real "nothing raised yet" state. Flip back to
  // false only to preview the seeded demo data on a prototype.
  live: true,

  // Demo seed: gross ≈ A$9,560 — past the A$6,000 floor, tracking toward
  // the A$17,530 goal; the developer tops up any shortfall. 10 of 12 spots
  // sold; the top-right square 1 and bottom-left square 2 stay open.
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