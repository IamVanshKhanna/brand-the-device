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

  // 31 spots on the real MacBook Pro 16" lid (35.57 × 24.81 cm).
  // All spots are identical 4×4cm squares (16cm²) — uniform grid, same price,
  // no premium tiers. Grid is 8 columns × 5 rows (40 cells) with 9 cells
  // removed to protect the Apple logo guard zone at center.
  // Grid labels A1–E8; Apple logo gap sits at B4–B5 / C4–C5 / D4–D5.
  // Positions are % of the lid, derived from real cm coordinates.
  // Base grid A$4,340 (31 × A$140, crosses the A$3,740 floor).
  // Targets sum to A$10,447 (~A$10,443 goal, A$4 over — closest round numbers).
  spots: [
    // --- Row A (top, full row) ---
    { id:"A1", view:"back", type:"square", col:1, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A1", pos:{x:3.4, y:4.8, w:11.2, h:16.1} },
    { id:"A2", view:"back", type:"square", col:2, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A2", pos:{x:14.6, y:4.8, w:11.2, h:16.1} },
    { id:"A3", view:"back", type:"square", col:3, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A3", pos:{x:25.9, y:4.8, w:11.2, h:16.1} },
    { id:"A4", view:"back", type:"square", col:4, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A4", pos:{x:37.1, y:4.8, w:11.2, h:16.1} },
    { id:"A5", view:"back", type:"square", col:5, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A5", pos:{x:48.4, y:4.8, w:11.2, h:16.1} },
    { id:"A6", view:"back", type:"square", col:6, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A6", pos:{x:59.6, y:4.8, w:11.2, h:16.1} },
    { id:"A7", view:"back", type:"square", col:7, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A7", pos:{x:70.8, y:4.8, w:11.2, h:16.1} },
    { id:"A8", view:"back", type:"square", col:8, row:1, price:140, target:337, w:4, h:4, size:"S", name:"A8", pos:{x:82.1, y:4.8, w:11.2, h:16.1} },
    // --- Row B (upper-mid, gap at centre for Apple logo) ---
    { id:"B1", view:"back", type:"square", col:1, row:2, price:140, target:337, w:4, h:4, size:"S", name:"B1", pos:{x:3.4, y:21.0, w:11.2, h:16.1} },
    { id:"B2", view:"back", type:"square", col:2, row:2, price:140, target:337, w:4, h:4, size:"S", name:"B2", pos:{x:14.6, y:21.0, w:11.2, h:16.1} },
    { id:"B3", view:"back", type:"square", col:3, row:2, price:140, target:337, w:4, h:4, size:"S", name:"B3", pos:{x:25.9, y:21.0, w:11.2, h:16.1} },
    { id:"B7", view:"back", type:"square", col:7, row:2, price:140, target:337, w:4, h:4, size:"S", name:"B7", pos:{x:70.8, y:21.0, w:11.2, h:16.1} },
    { id:"B8", view:"back", type:"square", col:8, row:2, price:140, target:337, w:4, h:4, size:"S", name:"B8", pos:{x:82.1, y:21.0, w:11.2, h:16.1} },
    // --- Row C (mid, wider gap for Apple logo) ---
    { id:"C1", view:"back", type:"square", col:1, row:3, price:140, target:337, w:4, h:4, size:"S", name:"C1", pos:{x:3.4, y:37.1, w:11.2, h:16.1} },
    { id:"C2", view:"back", type:"square", col:2, row:3, price:140, target:337, w:4, h:4, size:"S", name:"C2", pos:{x:14.6, y:37.1, w:11.2, h:16.1} },
    { id:"C3", view:"back", type:"square", col:3, row:3, price:140, target:337, w:4, h:4, size:"S", name:"C3", pos:{x:25.9, y:37.1, w:11.2, h:16.1} },
    { id:"C7", view:"back", type:"square", col:7, row:3, price:140, target:337, w:4, h:4, size:"S", name:"C7", pos:{x:70.8, y:37.1, w:11.2, h:16.1} },
    { id:"C8", view:"back", type:"square", col:8, row:3, price:140, target:337, w:4, h:4, size:"S", name:"C8", pos:{x:82.1, y:37.1, w:11.2, h:16.1} },
    // --- Row D (lower-mid, gap at centre for Apple logo) ---
    { id:"D1", view:"back", type:"square", col:1, row:4, price:140, target:337, w:4, h:4, size:"S", name:"D1", pos:{x:3.4, y:53.2, w:11.2, h:16.1} },
    { id:"D2", view:"back", type:"square", col:2, row:4, price:140, target:337, w:4, h:4, size:"S", name:"D2", pos:{x:14.6, y:53.2, w:11.2, h:16.1} },
    { id:"D3", view:"back", type:"square", col:3, row:4, price:140, target:337, w:4, h:4, size:"S", name:"D3", pos:{x:25.9, y:53.2, w:11.2, h:16.1} },
    { id:"D7", view:"back", type:"square", col:7, row:4, price:140, target:337, w:4, h:4, size:"S", name:"D7", pos:{x:70.8, y:53.2, w:11.2, h:16.1} },
    { id:"D8", view:"back", type:"square", col:8, row:4, price:140, target:337, w:4, h:4, size:"S", name:"D8", pos:{x:82.1, y:53.2, w:11.2, h:16.1} },
    // --- Row E (bottom, full row) ---
    { id:"E1", view:"back", type:"square", col:1, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E1", pos:{x:3.4, y:69.3, w:11.2, h:16.1} },
    { id:"E2", view:"back", type:"square", col:2, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E2", pos:{x:14.6, y:69.3, w:11.2, h:16.1} },
    { id:"E3", view:"back", type:"square", col:3, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E3", pos:{x:25.9, y:69.3, w:11.2, h:16.1} },
    { id:"E4", view:"back", type:"square", col:4, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E4", pos:{x:37.1, y:69.3, w:11.2, h:16.1} },
    { id:"E5", view:"back", type:"square", col:5, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E5", pos:{x:48.4, y:69.3, w:11.2, h:16.1} },
    { id:"E6", view:"back", type:"square", col:6, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E6", pos:{x:59.6, y:69.3, w:11.2, h:16.1} },
    { id:"E7", view:"back", type:"square", col:7, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E7", pos:{x:70.8, y:69.3, w:11.2, h:16.1} },
    { id:"E8", view:"back", type:"square", col:8, row:5, price:140, target:337, w:4, h:4, size:"S", name:"E8", pos:{x:82.1, y:69.3, w:11.2, h:16.1} },
  ],

  areaOf: { square: 16 },

  blurb: {
    square: "A 4×4cm square — uniform across the lid. Same size, same price, same weight. Pick any open spot and your logo sits there for years.",
  },

  guard: "The Apple logo is left exactly as Apple ships it — exclusive and untouched. Nothing is ever placed on it.",

  // LIVE MODE: true = auction starts EMPTY — A$0 raised, all 31 spots open, no
  // demo sponsors. This is the real "nothing raised yet" state. Flip back to
  // false only to preview the seeded demo data on a prototype.
  live: true,

  // Demo seed: gross ≈ A$4,400 — past the A$3,740 floor, tracking toward
  // the A$10,443 target; the developer tops up any shortfall. Some of the 31
  // spots sold; the rest stay open.
  // (Ignored entirely when DATA.live === true.)
  seed: [
    { spotId: "A1", draft: 420, sponsor: "Panthrex" },
    { spotId: "A8", draft: 380, sponsor: "Orbitdesk" },
    { spotId: "C2", draft: 360, sponsor: "Pixelpress" },
    { spotId: "C7", draft: 350, sponsor: "KernelKraft" },
    { spotId: "E1", draft: 330, sponsor: "Dune Labs" },
    { spotId: "E8", draft: 320, sponsor: "Junoire" },
    { spotId: "B3", draft: 310, sponsor: "Brightway" },
    { spotId: "D7", draft: 290, sponsor: "Mistral Ink" },
    { spotId: "A4", draft: 270, sponsor: "Nimbus" },
    { spotId: "E4", draft: 250, sponsor: "Arcline" },
  ],
};