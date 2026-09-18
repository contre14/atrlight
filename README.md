# ATR Website V12

A responsive, deployment-ready homepage prototype for Advanced TeleRadiology.

## V12 improvements

- Refined the site so each section has a distinct purpose instead of repeating the same claims.
- Reworked **Why ATR** around the hospital partnership experience: workflow fit, direct communication, and continued support.
- Replaced generic decorative glows with radiology-specific diagnostic grids, scanner rings, and a clinical hero-frame motif.
- Corrected the performance section to distinguish July 2026 turnaround/quality figures from overall company experience.
- Added a clear hospital-to-ATR workflow diagram in the Technology section.
- Added service-category labels, removed unsupported marketing wording, and softened the onboarding sequence to a typical process pending client confirmation.
- Added optimized images, explicit dimensions, lazy loading, keyboard controls, Escape-key behavior, reduced-motion support, visible focus states, social metadata, structured data, a sitemap, and robots rules.
- Added draft privacy, accessibility, and website-terms dialogs for client/legal review.

## Preview

Open `index.html` with a local web server, or open the included standalone HTML file supplied alongside the ZIP.

A quick local server command:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Main files

- `index.html`
- `styles.css`
- `script.js`
- `assets/`
- `robots.txt`
- `sitemap.xml`

## Inquiry form

The public inquiry form is intentionally a visual prototype. It validates fields locally but does not transmit information until ATR supplies an approved form endpoint or inbox.

Before launch, connect it to an approved service such as a Vercel serverless endpoint, Formspree, Web3Forms, or ATR's existing form-processing system.

## Items that still require client approval

- Leadership names, biographies, and authentic ATR team photography
- Exact onboarding sequence
- Approved hospital/client logos and testimonials
- Current radiologist count, annual study volume, and geographic reach
- Final legal/privacy language
- Form destination
- Final approval of all statistics, career details, and service claims
