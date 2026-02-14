# Seoul Sunset Theme Design

Date: 2026-02-14

## Goals
- Replace the current black-and-white, newspaper-like visual tone with a more atmospheric and memorable brand expression.
- Establish a Seoul sunset-inspired look and feel while preserving readability and trust.
- Keep the style system maintainable by using global design tokens instead of one-off per-page styling.

## Constraints and Decisions
- Scope: apply subtle theme styling site-wide, and stronger visual expression on the landing page only.
- Palette direction: orange + rose + deep blue dusk gradient.
- Mood: calm and premium rather than high-saturation energetic.
- Motion: subtle only (initial fade + very slow gradient shift).
- Accessibility: maintain strong text contrast and support `prefers-reduced-motion`.

## Recommended Approach
Use a **Global Sunset Tokens** approach.

Why:
- Gives consistent branding across all current and future pages.
- Reduces style drift and duplicated custom CSS.
- Allows controlled intensity: low on interior pages, high on landing hero.

## Theme Architecture
Define global CSS custom properties in `src/app/globals.css`:
- Background tokens: `--bg-base`, `--bg-surface`, `--bg-elevated`
- Text tokens: `--text-primary`, `--text-secondary`, `--text-inverse`
- Border tokens: `--border-soft`, `--border-strong`
- Accent tokens: `--accent-warm`, `--accent-rose`, `--accent-deep`

Background layering model:
- Site-wide base: low-intensity sunset tint/gradient for atmosphere.
- Landing-only hero: stronger gradient layer to create first-impression impact.

Typography:
- Keep current `Playfair Display` + `Work Sans` pairing.
- Slightly tune heading weight/spacing for premium tone.

## Component-Level Application Rules
- `src/app/layout.tsx`
  - Replace neutral hardcoded body background with token-based background classes.
  - Keep centered container and add subtle surface separation.

- `src/components/SiteHeader.tsx`
  - Use transparent/soft-tinted header surface for readability over gradient.
  - Keep links neutral by default; use warm accent on hover/focus.
  - Maintain restrained CTA styling (premium muted accent).

- `src/components/Button.tsx`
  - `primary`: deep tone background + inverse text, subtle hover shift.
  - `ghost`: sunset soft border/text instead of plain gray.
  - Add accent-aligned focus ring for keyboard navigation.

- Board/list card surfaces (`src/app/board/page.tsx` and similar)
  - Use `surface` token, soft border, and low-elevation shadow.
  - Preserve semantic status meaning while mapping colors into theme palette.

- `src/components/SiteFooter.tsx`
  - Shift divider and text to warm-neutral secondary tones.

## Page Strategy
- Landing (`src/app/page.tsx`): strongest theme expression.
  - Sunset hero background layer.
  - CTA section visually emphasized within premium restraint.

- Interior pages (`board`, `dm`, `gallery`, `profile`):
  - Lower visual intensity.
  - Prioritize content scanning and readability.

## Motion and Interaction
- Landing hero background: very slow gradient drift (20-40s cycle).
- Initial page/section reveal: short and subtle fade-up.
- Respect `prefers-reduced-motion`: disable non-essential animation.

## Responsive Behavior
- Reduce hero gradient vertical footprint on small screens.
- Adjust header spacing so nav/CTA does not wrap awkwardly.
- Maintain touch targets close to 44px for key controls.

## Success Criteria
- Visual identity clearly shifts from monochrome/newspaper feel to Seoul sunset premium feel.
- Landing page visual intensity is noticeably stronger than interior pages.
- Readability and navigation clarity remain strong across all pages.
- No heavy animation or decorative effects that hurt performance.

## Risks and Mitigations
- Risk: beautiful but low-contrast text.
  - Mitigation: token contrast checks and conservative text color defaults.
- Risk: style inconsistency over time.
  - Mitigation: token-first rules and component-level mapping standards.
- Risk: motion discomfort.
  - Mitigation: slow animation only + `prefers-reduced-motion` support.

## Out of Scope
- Functional feature additions (auth flow changes, DB model changes, API behavior changes).
- Full redesign of IA or content strategy.
