# Responsive / Viewport Polish

Implemented for the current ATR website baseline.

## What changed
- Earlier mobile navigation breakpoint at 1180px to prevent crowded or overlapping header text on common laptops.
- Added layout guardrails (`min-width: 0`, balanced wrapping, safer word wrapping) to prevent grid/flex text overlap.
- Preserved image aspect ratios with `object-fit: cover` for all photographic panels.
- Added responsive viewport-height tuning for common laptop displays including 1366×768, 1440×900, and 1536×864.
- Major desktop sections now occupy at least the visible viewport below the fixed header.
- Added gentle CSS scroll snapping on desktop/laptop so sections settle cleanly into the viewport.
- Compact vertical rhythm on shorter laptop screens so headings, content, and CTAs fit without excessive within-section scrolling.
- Mobile/tablet and very short screens intentionally keep normal document scrolling so forms and accordions remain accessible.
- Synced the external `styles.css` with the latest standalone stylesheet so the service-scale statistics styles are present in the deployable `index.html` build.

No website copy or content was changed in this pass.
