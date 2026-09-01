# Optimization Checklist

Each hour, pick ONE unchecked item from this list, implement it, check it off, and log it in TRACKING.md. Never skip items. Never do two at once. Never modify something that's already been checked off (unless it's a regression fix).

## Code Quality
- [ ] Remove any console.log statements left in production code (js/app.js, js/data.js)
- [ ] Add `"use strict"` to any JS file missing it
- [ ] Verify all HTML files pass W3C validator (no unclosed tags, proper nesting)
- [ ] Check for and fix any CSS specificity issues (overly nested selectors)
- [ ] Remove unused CSS classes (grep for class names in HTML, compare to CSS)
- [ ] Remove dead code / commented-out blocks in JS files
- [ ] Ensure all HTML `alt` attributes are non-empty on images
- [ ] Add `lang="en"` attribute to all HTML files if missing
- [ ] Verify all `<meta>` tags have proper charset and viewport
- [x] Check that all internal links resolve (no broken anchors)

## Performance
- [ ] Minify inline JS in HTML files (remove unnecessary whitespace)
- [ ] Optimize CSS: combine duplicate selectors if any
- [ ] Add `loading="lazy"` to below-fold images if any exist
- [ ] Verify no render-blocking resources in `<head>`
- [ ] Check if any CSS can be inlined (small files loaded separately)
- [x] Add `dns-prefetch` for external domains (Stripe, Cloudflare Worker)
- [ ] Ensure gzip/brotli is configured on GitHub Pages (check headers)
- [ ] Verify image formats are optimal (SVG for icons, WebP if applicable)

## Accessibility
- [ ] Add `aria-label` to icon-only buttons (bid buttons, carousel controls)
- [ ] Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Add `role` attributes to interactive custom elements
- [ ] Ensure all form inputs have associated `<label>` elements
- [ ] Check keyboard navigation works for bid modal and carousel
- [x] Add `aria-live` regions for dynamic content (raised amount, bid updates)
- [ ] Verify focus indicators are visible on all interactive elements
- [x] Add skip-to-content link at top of index.html
- [ ] Ensure carousel has proper `aria-roledescription` and controls
- [ ] Test with screen reader: verify spot labels are announced correctly

## SEO & Meta
- [ ] Verify `<title>` tag is descriptive and under 60 chars
- [x] Check meta description is present and under 160 chars
- [ ] Add Open Graph tags (`og:title`, `og:description`, `og:image`) if missing
- [ ] Add Twitter Card meta tags if missing
- [x] Verify `robots.txt` exists and is correct
- [ ] Verify `sitemap.xml` includes all pages
- [ ] Add canonical URL `<link>` to all pages
- [x] Ensure structured data (JSON-LD) is valid and complete
- [ ] Check that all pages have unique `<title>` tags
- [ ] Verify no duplicate content across pages

## Copy & Content
- [ ] Read hero copy aloud — is it clear in under 5 seconds?
- [ ] Check for typos/grammar across all HTML files
- [x] Verify all numbers are consistent (goal, floor, retail, spot count)
- [ ] Ensure CTA buttons have action-oriented text
- [ ] Check that FAQ answers are concise and accurate
- [x] Verify terms.html references correct numbers and device specs
- [x] Verify press.html has accurate fact sheet
- [ ] Check privacy.html for completeness
- [ ] Ensure marketplace.html waitlist flow is clear
- [ ] Review meta-band text for clarity and impact

## Visual & UX
- [ ] Verify lid grid renders correctly at 375px (mobile) width
- [ ] Check that spot hover states work (cursor, opacity change)
- [ ] Verify bid modal opens/closes cleanly on mobile
- [ ] Test dark mode toggle persists across page reloads
- [x] Check that countdown timer displays correctly
- [ ] Verify progress bars animate smoothly
- [ ] Ensure spot list scrolls smoothly on mobile
- [x] Check that legend displays correctly with single tier
- [ ] Verify deposit flow modal has clear copy
- [ ] Test carousel swipe on touch devices (check JS touch events)

## Security
- [x] Verify no secrets/keys are exposed in client-side code (check data.js)
- [ ] Ensure Stripe key is publishable (pk_test_), not secret
- [ ] Check that API calls use HTTPS (not HTTP)
- [ ] Verify no inline `onclick` handlers with sensitive logic
- [ ] Ensure CSP headers are set if possible (GitHub Pages may limit this)
- [ ] Check for XSS vectors in user-supplied data (bidder names, logos)

## Business Logic
- [ ] Verify min-bid calculation is correct (current + increment)
- [ ] Check that deposit amount is correct (20% of bid)
- [ ] Verify outbid notification logic works
- [ ] Ensure refund logic triggers below floor
- [ ] Check that live mode flag works (DATA.live = true/false)
- [ ] Verify demo seed loads correctly when DATA.live = false
- [ ] Test bid submission flow end-to-end (mock)
- [ ] Verify spot status updates propagate correctly
- [ ] Check that target display matches DATA.spots[].target
- [x] Ensure areaOf calculation matches spot dimensions
