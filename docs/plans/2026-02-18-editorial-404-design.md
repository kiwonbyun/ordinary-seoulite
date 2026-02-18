# Editorial 404 Page Design

**Context**
- Project currently has no custom 404 route handling in `src/app/router.tsx`.
- Global typography already supports editorial tone via `.font-editorial` in `src/styles/global.css`.

**Design Goals**
- Keep existing global navigation visible.
- Render a minimal editorial-style 404 body in the outlet area.
- Provide clear recovery actions (go home / browse board).

**Approach**
- Add a dedicated route component file: `src/app/routes/not-found.tsx`.
- Wire it through `notFoundComponent` on the root route.
- Use restrained layout: serif headline, fine borders, compact meta label, and clean CTAs.

**UX Copy**
- Headline: `404`
- Subhead: page not found copy in Korean
- Actions: home and board navigation links

**Testing Strategy**
- Add router-level test that navigates to a missing path and asserts custom 404 copy is shown.
