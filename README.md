# TKC Website V1.0 — Coding Alpha 3

**Development baseline:** Accepted Alpha 1 layout and Alpha 2 motion features. Alpha 1 and Alpha 2 are preserved on their respective branches. Alpha 3 lives on `tkc-coding-alpha3` and adds only the requested interaction improvements.

This build is an HTML/CSS/JavaScript reconstruction of the **latest saved Webflow design**, including its primary styling, responsive breakpoints, customer/brand tabs, six engineering project cards, selected portfolio entries, contact information and pending PDF placeholders. No Webflow subscription is needed to run this local build.

## Run locally on Windows

1. Download the **tkc-coding-alpha3** branch ZIP from GitHub.
2. Extract the entire ZIP to a new folder. Keep `index.html`, `css/`, `js/` and project image files together.
3. From that folder open Terminal / PowerShell and run:

```powershell
node server.js
```

4. Open **http://localhost:3000** in Chrome or Edge.
5. Stop the server with **Ctrl+C**.

You may also double-click `index.html` for a basic preview, but the local server is recommended.

## Run static acceptance tests

```powershell
node --test
```


### Alpha 3 acceptance corrections — October 9, 2026

- Corrected desktop menu ordering (Projects before Brands) to match the existing page structure; no website sections were moved.
- Removed the left/right service carousel buttons and their dedicated 82px controls column.
- Resolved carousel autoplay appearing stationary when the mouse pointer rests over the strip: ordinary hover no longer pauses motion.
- Increased the gentle automatic movement to approximately 52 pixels/second when visible and enabled, and added a discreet pause/resume toggle.
- Kept manual horizontal swipe, mouse drag, trackpad and keyboard input; manual interaction briefly pauses autoplay before it resumes.

## Alpha 3 — Navigation, Services & Engineering Project Details

This release addresses the October 9 acceptance feedback while maintaining the original Webflow colors, type, cards and layout.

### Changes

- **Sticky navigation** — navbar remains visible when scrolling, with subtle elevation when the document moves and a yellow underline for both hovered and active section links. Mobile navigation behavior is retained.
- **Continuous service carousel** — the four existing TKC service cards drift automatically left and wrap seamlessly. The left/right screen buttons have been removed; users can still drag, swipe, scroll horizontally, or use keyboard arrows. Autoplay does not stop on ordinary hover. A compact Pause/Play control is available; manual interactions pause movement briefly, and autoplay is disabled for reduced-motion users.
- **Engineering project modals** — all six existing project cards can be activated by click or Enter/Space. The modal includes the existing project image, title, customer, and four clearly labeled placeholders: Application/Background, Engineering Scope, Technical Specifications, and Project Outcome. No unverified project information was introduced.
- **Floating WhatsApp-style contact icon** — opens the website's Contact Us section using an internal anchor, not an external WhatsApp message.
- **Accessibility** — modal focus is restored to the originating card; Escape and the close button dismiss it; keyboard Tab stays within the dialog; service navigation has dedicated accessible labels and pause behavior.
- **No Bootstrap dependency** — retained native HTML/CSS/JS to preserve visual consistency and minimize page weight.

### Browser acceptance checklist (Windows)

- [ ] Desktop: verify navbar order **Home → About → Capabilities → Projects → Brands → Contact**, then hover every item. The section order itself must stay unchanged.
- [ ] Scroll slowly through the page. Confirm the white navbar stays visible and its current-section indicator follows the page.
- [ ] Watch the service cards move automatically from right to left and reappear seamlessly. Hover the strip: autoplay should **continue** rather than freezing.
- [ ] Confirm the left/right screen arrow buttons are gone; use the small Pause/Play button to stop/resume, and try horizontal trackpad/finger swipe, mouse drag and keyboard arrows (focus the carousel first).
- [ ] Open each of the six engineering projects and verify the correct image, name and client. Confirm all four information fields show placeholders, not fabricated technical facts.
- [ ] Close the modal using the × button, Escape and backdrop. Confirm keyboard focus returns to the project card.
- [ ] Click the floating green WhatsApp-style icon; it must scroll to Contact Us, not navigate to an external WhatsApp link.
- [ ] Check mobile at 390px and tablet at 820px for no clipping, unwanted horizontal page scroll or overlapping floating controls.
- [ ] Enable Windows reduced-motion preference and reload: reveal effects should be absent and service autoplay should stop.
- [ ] Check that existing portfolio tabs, contact numbers and disabled PDF placeholders remain as in Alpha 2.

### Automated tests

Run `node --test` from the project folder. It executes the unchanged Alpha 1 tests, the maintained Alpha 2 motion tests, and the new Alpha 3 tests.

**Deployment:** Not deployed. Use the local Node.js preview (`node server.js`) until acceptance is confirmed.

---

## Alpha 2 — Motion & Interaction Polish

The accepted Webflow visual design and all Alpha 1 fixes are preserved. Alpha 2 adds:

- **One-time scroll reveals** for section headings, selected supporting text, capability cards, project cards, and visible brand/customer entries. Elements appear with subtle fading and ~22px upward movement.
- **Staggered project cards** — 85ms intervals for groups of three on desktop; no stagger delay on narrow mobile layouts.
- **Subtle hover feedback** for project tiles, brand/customer entries, and actual navigation/action buttons. Disabled PDF placeholders do not animate as if clickable.
- **Active-section navigation** with a small yellow indicator based on scrolling.
- **Reduced-motion support**: animations do not initialize when reduced motion is requested; existing animations stop and hidden entries become visible if that preference changes.
- **Progressive enhancement**: all content remains visible if JavaScript or IntersectionObserver is unavailable.
- **No external JS packages**: all interactions use browser-native APIs.

### Alpha 2 acceptance checklist

- [ ] Compare the homepage against accepted Alpha 1 — no layout or content changes
- [ ] Scroll slowly through About, Business, Capabilities, Projects, Brands, Customers, CSR and Contact; elements should gently appear once
- [ ] Scroll backward; revealed elements should stay visible (no replay)
- [ ] View the six project cards; modest stagger on desktop and no distracting delay on mobile
- [ ] Hover buttons and project cards — no text shift or layout overflow
- [ ] Switch Mechanical/Electrical/IT and Astra/Non-Astra/Food tabs — categories and names remain correct
- [ ] Confirm mobile menu open/close, WhatsApp contacts, and both disabled PDF placeholders still work as Alpha 1
- [ ] Enable **Reduce motion** in operating-system accessibility preferences, reload, and verify all content appears without reveal animation
- [ ] Test at 1280px, 820px, 600px and 390px; no horizontal scrollbar

### Automated checks

Run from the project folder on your Windows laptop:

```powershell
node --test
```

This runs both the original `tests/smoke.test.js` tests and the new `tests/motion.test.js` behavioral tests.

## Alpha 1 corrective patch — October 9, 2026

This branch includes fixes from the first Windows browser screenshots:

- Removed the 45% + 55% plus-gap desktop About grid overflow by switching to shrinkable proportional tracks.
- Allowed the hero's right-side supporting note to wrap instead of being clipped.
- Corrected missing spaces in the heading copy and allowed INDUSTRIAL SUPPORT to wrap inside its panel.
- Removed PT Astra Honda Motor from the Engineering Customers showcase (and hid that entry in Webflow); retained the PT AHM Stocker Out engineering project.
- Preserved the same visual identity, palette, typography and content hierarchy.

If you tested the first ZIP, download the ZIP again and extract into a **new folder** to avoid mixing old/new files.

## Alpha 1 acceptance checklist

- [ ] Desktop header and footer visually match the latest Webflow design
- [ ] Hero, service strip, About, Business, Capabilities, six Projects, Trading Brands, Engineering Customers, CSR and Contact render correctly
- [ ] Both category filters switch across three panes; arrow keys navigate tabs
- [ ] Mobile menu opens, closes, follows section links and responds to Escape
- [ ] Six project images display; customer/brand chips and hidden names reflect Webflow
- [ ] WhatsApp numbers, email and internal links work
- [ ] Two PDF download controls say **Coming soon** and cannot download yet
- [ ] At 1280px, 820px, 600px and 390px nothing overflows horizontally
- [ ] New SVG logo appears in navbar, footer and favicon

## Files

- `index.html` — reconstructed Webflow page content and metadata
- `css/styles.css` — Webflow-derived visual styles plus responsive layout rules
- `js/main.js` — accessible vanilla JS for tabs, mobile menu, scroll reveals and active navigation
- `css/motion.css` — Alpha 2 progressive, reduced-motion-aware entrance and hover effects
- `css/alpha3.css` — Alpha 3 sticky navbar, service carousel, project modal and floating contact button
- `js/alpha3.js` — Alpha 3 native JavaScript interactions
- `tests/alpha3.test.js` — functional regressions for all Alpha 3 components
- `tests/motion.test.js` — behavioral regression tests for interactions and scroll motion
- `project-1.png`–`project-6.png` — original TKC project images
- `tkc-logo-refined.svg` — scalable TKC identity; `tkc-cover.jpg` social media image
- `server.js` — zero-dependency Node.js static preview server
- `tests/smoke.test.js` — static regression checks

## Known differences / review notes

- Exact browser rendering cannot be guaranteed until you compare this coded build side by side with **Webflow's unpublished Designer state**. This was reconstructed from the Webflow API element and style data rather than generated using Webflow's paid code export.
- The Webflow hero image currently uses an externally-hosted Unsplash photo. Internet connectivity is required for that background; replace with a licensed local asset for production.
- The logo and other assets are referenced locally where available. Some Webflow CSS may still include remotely hosted decorative imagery.
- PDF downloads remain disabled until both final PDF documents are provided.
- The brand/customer entries flagged hidden in Webflow remain in HTML as hidden, matching the current curated selection. We can choose to remove that historical data from the public HTML in later versions.
- Alpha 1 uses native browser behavior and is **not deployed**. Final visual/browser acceptance testing remains mandatory before hosting.
