# Home Hero River Image Design

Date: 2026-02-14

## Goals
- Make `/` visually stronger using the provided peaceful Korean river image.
- Preserve readability and CTA clarity while increasing emotional impact.
- Keep implementation simple and aligned with existing sunset brand styling.

## Scope
- Update only home hero visual presentation.
- Keep existing copy and core CTA structure.
- Add responsive image source strategy (desktop/mobile split).

## Constraints and Decisions
- Primary desktop image: `public/main-image.webp`.
- Mobile image: `public/jong-ro.webp`.
- Mobile breakpoint: `max-width: 768px`.
- Hero style: full-bleed image background with text overlay.
- Overlay strength: strong for readability, stronger on mobile.

## Recommended Approach
Use image-backed hero with layered dark gradient overlay while preserving existing section structure.

Why:
- Fastest path to a premium visual jump.
- Reuses existing hero markup and tests with minimal behavioral risk.
- Supports responsive image art direction without layout rewrite.

## Visual Structure
- Hero remains a single section with rounded corners and shadow.
- Background image fills hero area.
- Overlay layers:
  - broad dark gradient for text legibility
  - subtle tint preserving sunset mood
- Foreground content stays left-aligned and scannable.

## Responsive Image Strategy
- Desktop/tablet (`>= 769px`): `main-image.webp`
- Mobile (`<= 768px`): `jong-ro.webp`
- Use `picture`/`source` style art direction or equivalent CSS media strategy.

## Typography and CTA
- Keep existing headline/body copy.
- Slight desktop headline emphasis allowed.
- Keep CTA hierarchy unchanged.

## Motion and Performance
- Avoid heavy motion on hero image.
- Keep transitions subtle.
- Reuse optimized static files under `public`.

## Testing Strategy
- Keep existing landing tests.
- Add/adjust behavior-level assertion for hero image structure hook if needed.
- Avoid brittle pixel-perfect screenshot tests.

## Done Criteria
- Home hero uses `main-image.webp` on desktop and `jong-ro.webp` on mobile.
- Text remains highly readable on both sizes.
- Existing CTA remains prominent and usable.
- No regressions in landing page tests.
