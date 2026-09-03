# Optimization Checklist

Each hour, pick ONE unchecked item from this list, implement it, check it off, and log it in TRACKING.md. Never skip items. Never do two at once. Never modify something that's already been checked off (unless it's a regression fix).

## Code Quality
- [x] Remove any console.log statements left in production code (js/app.js, js/data.js)
- [x] Add `"use strict"` to any JS file missing it
- [x] Verify all HTML files pass W3C validator (no unclosed tags, proper nesting)
- [x] Check for and fix any CSS specificity issues (overly nested selectors)
- [x] Remove unused CSS classes (grep for class names in HTML, compare to CSS)
- [x] Remove dead code / commented-out blocks in JS files
- [x] Ensure all HTML `alt` attributes are non-empty on images
- [x] Add `lang="en"` attribute to all HTML files if missing
- [x] Verify all `<meta>` tags have proper charset and viewport
- [x] Check that all internal links resolve (no broken anchors)

## Performance
- [x] Minify inline JS in HTML files (remove unnecessary whitespace) — verified: only 2 inline scripts (1-line theme pre-paint + 20-line waitlist handler), already minimal; manual minification would hurt readability for negligible bytes
- [x] Optimize CSS: combine duplicate selectors if any — verified: no real duplicate selectors; all selectors are unique or scoped variants (.mock-final .spot ≠ .spot)
- [x] Add `loading="lazy"` to below-fold images if any exist
- [x] Verify no render-blocking resources in `<head>`
- [x] Check if any CSS can be inlined (small files loaded separately)
- [x] Add `dns-prefetch` for external domains (Stripe, Cloudflare Worker)
- [x] Ensure gzip/brotli is configured on GitHub Pages (check headers)
- [x] Verify image formats are optimal (SVG for icons, WebP if applicable)

## Accessibility
- [x] Add `aria-label` to icon-only buttons (bid buttons, carousel controls)
- [x] Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- [x] Add `role` attributes to interactive custom elements
- [x] Ensure all form inputs have associated `<label>` elements
- [x] Check keyboard navigation works for bid modal and carousel
- [x] Add `aria-live` regions for dynamic content (raised amount, bid updates)
- [x] Verify focus indicators are visible on all interactive elements
- [x] Add skip-to-content link at top of index.html
- [x] Ensure carousel has proper `aria-roledescription` and controls
- [x] Test with screen reader: verify spot labels are announced correctly

## SEO & Meta
- [x] Verify `<title>` tag is descriptive and under 60 chars
- [x] Check meta description is present and under 160 chars
- [x] Add Open Graph tags (`og:title`, `og:description`, `og:image`) if missing
- [x] Add Twitter Card meta tags if missing
- [x] Verify `robots.txt` exists and is correct
- [x] Verify `sitemap.xml` includes all pages
- [x] Add canonical URL `<link>` to all pages
- [x] Ensure structured data (JSON-LD) is valid and complete
- [x] Check that all pages have unique `<title>` tags
- [x] Verify no duplicate content across pages

## Copy & Content
- [x] Read hero copy aloud — is it clear in under 5 seconds?
- [x] Check for typos/grammar across all HTML files
- [x] Verify all numbers are consistent (goal, floor, retail, spot count)
- [x] Ensure CTA buttons have action-oriented text
- [x] Check that FAQ answers are concise and accurate
- [x] Verify terms.html references correct numbers and device specs
- [x] Verify press.html has accurate fact sheet
- [x] Check privacy.html for completeness
- [x] Ensure marketplace.html waitlist flow is clear
- [x] Review meta-band text for clarity and impact

## Visual & UX
- [x] Verify lid grid renders correctly at 375px (mobile) width
- [x] Check that spot hover states work (cursor, opacity change)
- [x] Verify bid modal opens/closes cleanly on mobile
- [x] Test dark mode toggle persists across page reloads
- [x] Check that countdown timer displays correctly
- [x] Verify progress bars animate smoothly
- [x] Ensure spot list scrolls smoothly on mobile
- [x] Check that legend displays correctly with single tier
- [x] Verify deposit flow modal has clear copy
- [x] Test carousel swipe on touch devices (check JS touch events)

## Security
- [x] Verify no secrets/keys are exposed in client-side code (check data.js)
- [x] Ensure Stripe key is publishable (pk_test_), not secret
- [x] Check that API calls use HTTPS (not HTTP)
- [x] Verify no inline `onclick` handlers with sensitive logic
- [x] Ensure CSP headers are set if possible (GitHub Pages may limit this) — GitHub Pages doesn't support HTTP headers; added <meta http-equiv="Content-Security-Policy"> to index.html as defense-in-depth (default-src 'self', script/style/img/connect/frame-src scoped to known origins). Other pages are static-only (no API/Stripe) so CSP is lower priority there.
- [x] Check for XSS vectors in user-supplied data (bidder names, logos)

## Business Logic
- [x] Verify min-bid calculation is correct (current + increment)
- [x] Check that deposit amount is correct (20% of bid)
- [x] Verify outbid notification logic works
- [x] Ensure refund logic triggers below floor (copy hardened: deposits held, refunds issued by founder by hand)
- [x] Check that live mode flag works (DATA.live = true/false)
- [x] Verify demo seed loads correctly when DATA.live = false
- [x] Test bid submission flow end-to-end (mock)
- [x] Verify spot status updates propagate correctly
- [x] Check that target display matches DATA.spots[].target
- [x] Ensure areaOf calculation matches spot dimensions
