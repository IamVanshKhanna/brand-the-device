"use strict";

const DATA = {
  brand: "Brand the Device",
  currency: "AUD",
  display: "A$",
  // USD view is display-only; all bids settle in AUD. ~0.71 mid-market (2026-08).
  fx: { usdPerAud: 0.71 },
  ownerName: "Vansh",
  ownerLink: "https://x.com/vanshuETH",  // human's real handle

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
  // RRP ≈ A$11,833 (apple.com/au, 16-inch M5 Max 18-core/40-core, Silver,
  // nano-texture). grossToRaise = retail ÷ (1 − tax) = retail ÷ 0.675.
  floor: 6000, // go / no-go — full refund below this, no Mac.
  goal: {
    title: "128GB · 2TB · nano-texture",
    retail: 11833,
    grossToRaise: 17530,
  },
  topup: "One fixed config — no lesser laptop, ever. If the raise comes up short, the developer pools in the difference from his own money so the machine is exactly the one promised.",
  stretch: "Every dollar above the goal tops up what the developer keeps.",

  reasonsToRetail: "RRP estimate from apple.com/au using the verified 48GB/2TB anchor (A$7,999) plus Apple's AU memory, storage, and nano-texture steps; quoted '≈ A$'; exact price locked when the auction closes with a link to the configurator.",

  // 12 spots on a 3×3 sector layout of the lid: the four directional spots
  // (N / E / S / W) are the big ones; each corner splits into two 4×4 cm
  // squares; the center cell is the Apple logo's guard ring. Base grid
  // totals exactly A$6,000 = the floor: sell every spot at base and the
  // go/no-go floor is crossed; outbids climb toward the fixed goal.
  spots: [
    // --- top row: left corner squares, N banner, right corner squares ---
    { id: "nw-a",  view: "back", type: "mini", col: 1, span: 1, row: 1, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Top left — square 1" },
    { id: "nw-b",  view: "back", type: "mini", col: 2, span: 1, row: 1, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Top left — square 2" },
    { id: "marquee", view: "back", type: "marquee", col: 3, span: 2, row: 1, rowspan: 2, price: 1200, w: 14, h: 6, size: "L", name: "Marquee — above the Apple logo" },
    { id: "ne-a",  view: "back", type: "mini", col: 5, span: 1, row: 1, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Top right — square 1" },
    { id: "ne-b",  view: "back", type: "mini", col: 6, span: 1, row: 1, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Top right — square 2" },
    // --- middle row: W strip, [Apple logo guard], E strip ---
    { id: "w", view: "back", type: "flank", col: 1, span: 2, row: 3, rowspan: 2, price: 1000, w: 8, h: 9, size: "L", name: "West — left of the Apple logo" },
    { id: "e", view: "back", type: "flank", col: 5, span: 2, row: 3, rowspan: 2, price: 1000, w: 8, h: 9, size: "L", name: "East — right of the Apple logo" },
    // --- bottom row: left corner squares, S banner, right corner squares ---
    { id: "sw-a",  view: "back", type: "mini", col: 1, span: 1, row: 5, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Bottom left — square 1" },
    { id: "sw-b",  view: "back", type: "mini", col: 2, span: 1, row: 5, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Bottom left — square 2" },
    { id: "s",     view: "back", type: "snipe", col: 3, span: 2, row: 5, rowspan: 2, price: 800, w: 14, h: 5, size: "M", name: "South — under the Apple logo" },
    { id: "se-a",  view: "back", type: "mini", col: 5, span: 1, row: 5, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Bottom right — square 1" },
    { id: "se-b",  view: "back", type: "mini", col: 6, span: 1, row: 5, rowspan: 2, price: 250, w: 4, h: 4, size: "S", name: "Bottom right — square 2" },
  ],

  areaOf: { marquee: 84, flank: 72, snipe: 70, mini: 16 },

  blurb: {
    marquee: "The big one above the Apple logo — the loudest spot on a 16-inch lid.",
    flank: "Full-tall edge strip along the side, right beside the Apple logo.",
    snipe: "The wide bottom banner — the part people actually read first in a café.",
    mini: "Compact 4×4 cm corner square — two per corner. Great for tight, simple logos.",
  },

  guard: "The Apple logo keeps a slim ~5 mm guard ring. Nothing ever touches it.",

  // Demo seed: gross ≈ A$9,560 — past the A$6,000 floor, tracking toward
  // the A$17,530 goal; the developer tops up any shortfall. 10 of 12 spots
  // sold; the top-right square 1 and bottom-left square 2 stay open.
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