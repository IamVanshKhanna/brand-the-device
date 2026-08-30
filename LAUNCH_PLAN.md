# Brand the Device — Launch Plan (v2)

> Companion to `README.md`. This is the **how + when**; README has the *what* and
> the production checklist. Core tactic: the story travels, not the site — show
> the live lid, publish every number, never fake hardship. The lid auction is an
> **original stunt** — one fixed machine, no tiers, and the developer tops up any
> shortfall himself.

## 0. Positions (who we are in public)

- **Hook:** "bought before he owns it" — the machine's price is written by the
  stickers on its own lid.
- **Proof of audience:** rely on the live numbers of *this* site (12 spots,
  real-time bid board, countdown), not a prior run. The site is the first of its
  kind here — that is the story.
- **Tone:** self-aware stunt, not charity. Refund guard first, P&L at the end.
- **Voice persona:** Vansh (owner). First-person, numbers-out, no hype.

## 1. Launch gate (the hard prerequisites)

All three must be green before the "open for bids" switch. Until then the site
is a demo with seeded fake bids (currently live as such).

| # | Gate | Owner | Notes |
|---|---|---|---|
| G1 | Domain + real brand assets (favicon/logo already in repo) | human | `brandthe.device`-style; point at the static deploy |
| G2 | Stripe wired: 20% deposit capture, auto-refund on outbid/below-floor | human | README: Stripe keeps fee on refunds — budget or re-word deposit |
| G3 | Backend: bids DB + logo storage + outbid emails | worker/dev | Supabase or equivalent; the site already captures sponsor/email/URL/logo via `DATA` + localStorage |

Soft gates (do before G1–G3 land, not blockers for demo):
- Privacy + Terms pages (mandatory once real emails/logos/deposits flow).
- Empty `DATA.seed`, flip demo note off, deploy once.

## 2. Timeline (launch = the moment bids open for real)

| T | Window | Activity |
|---|---|---|
| T-14 → T-7 | **Tease** | 3× X posts: (1) "I'm renting out the lid of a MacBook I don't own yet" + mock; (2) the one fixed machine (M5 Max, 128GB/2TB, nano-texture) + the top-up pledge; (3) countdown open. |
| T-7 → T-1 | **Open beta** | Post the live site + 12-spot grid walkthrough (video). |
| T-1 | **Press drop** | Pitch the one-pager (site has "For the press" fact sheet): TechSpot / Tom's Hardware / The Verge / Lifehacker AU — plus local founder/indie-hacker outlets. |
| **T** | **GO / GO-NO-GO** | Depends on G1–G3. Announce open-for-bids with a launch thread (write it in an image-friendly format: screenshot the lid mock) |
| T+1 → T+7 | **Live** | Daily public update: top bids + percent toward the A$6,000 floor and the A$17,530 goal (the bars ARE the update). Outbid email triggers re-engagement. |
| T+30 (2026-09-30 20:00Z) | **Close** | Clear countdown state; send winners payment links; start 2-week vinyl production window. |
| Close + 30d | **P&L publish** | Full gross → tax → config → expenses (include the developer's top-up, if any). This is the trust + the case study for the SaaS. |

## 3. The X thread (draft skeleton, launch day)

1. **Open:** "I am selling the lid of a MacBook I don't own yet."
2. **The twist:** "One machine, no tiers — if this doesn't raise enough, I top up
   the difference from my own money so the specs on the page are exactly what ships."
3. **The numbers:** 12 spots, A$6,000 floor, ≈A$17,530 goal (M5 Max 128GB/2TB
   nano-texture after ~32.5% tax), full refund below floor, P&L public after.
4. **The canvas:** screenshot of the lid mock with the marquee slot.
5. **CTA:** "Bid on a spot or outbid one — link below." + banner image.
6. Pin the thread; reply-to with numbers every 24h during the live window.

## 4. Content calendar while live (draft)

- **Spotlight a spot a day** — one sponsor/logo + which side of the lid it sits on.
- **"Where the lid goes"** — photo posts once the Mac arrives; ties placement
  proof to the wrap-up.
- **Progress re-cap** every time a bar crosses (the "Floor passed — dev tops up
  the rest" / "Goal reached" states map 1:1 to a post).

## 5. Risks & fallbacks

| Risk | Fallback |
|---|---|
| Under A$6,000 at close | Full refunds, P&L published showing $0 kept, humble post — good will + feed the SaaS |
| Visa/work schedule squeeze | Keep bid window long (30d); batch daily updates, delegate help via outbox if floor has workers |
| Copycat saturation | Differentiator: one fixed config + the developer top-up pledge + real paper (refund guard + P&L) + 16" canvas — say it explicitly |
| Payment/tech failure at launch | Back to demo mode until fixed; never take deposits with broken plumbing |

## 6. Post-launch conversion

Sell-out → redirect overflow to **Brand the Device waitlist** (the SaaS play).
Keep the P&L + sponsor case studies as the SaaS's landing-page proof.

---
_Status: v2 draft. Gates G1–G3 are human/backend items; timeline assumes they
land before 2026-09-20 to leave a 10-day live window before close._