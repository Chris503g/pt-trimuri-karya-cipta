# TKC Website V1.0 — Coding Alpha 2

**Development baseline:** Accepted TKC Coding Alpha 1, faithfully reconstructed from the latest TKC Webflow design. Alpha 1 remains frozen on branch `tkc-coding-alpha1`. All Alpha 2 changes are isolated on branch `tkc-coding-alpha2`.

This build is an HTML/CSS/JavaScript reconstruction of the **latest saved Webflow design**, including its primary styling, responsive breakpoints, customer/brand tabs, six engineering project cards, selected portfolio entries, contact information and pending PDF placeholders. No Webflow subscription is needed to run this local build.

## Run locally on Windows

1. Download the **tkc-coding-alpha2** branch ZIP from GitHub.
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
