# Responsive Polish v10

## Scroll-snap boundary fix

Corrected the small awkward snap positions that showed the bottom edge of the previous subsection beneath the fixed navigation.

Cause: desktop sections had both `html { scroll-padding-top: ... }` and `main > section { scroll-margin-top: ... }`, so the fixed-header offset was effectively counted twice during scroll snapping.

Change: desktop/laptop snap-managed sections now use `scroll-margin-top: 0` while retaining the global `scroll-padding-top` for the fixed header. Section snapping remains enabled, but each section now settles directly beneath the navigation instead of leaving a visible strip from the previous section.

No content, typography, images, section sizes, or approved spacing were changed.
