# Responsive polish v2

This pass corrects the viewport-fit issue visible in the Technology section on 1536×768-class laptop browser viewports.

Changes:
- Added section scroll offset for the fixed navigation so section headings no longer tuck underneath the header.
- Changed split-image desktop sections to use the visible viewport height rather than only a minimum height.
- Rebalanced Technology so the image, copy, four technology points, and “How information moves” workflow strip fit in one visible laptop panel.
- Added an extra compact treatment for short laptop browser viewports (720–780 px tall).
- Preserved natural scrolling on tablets/phones.
- Reinforced `object-fit: cover` for large photographic panels so different aspect ratios crop instead of stretch.
