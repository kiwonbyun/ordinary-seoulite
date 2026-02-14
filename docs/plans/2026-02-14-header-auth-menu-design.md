# Header Auth Status Menu Design

Date: 2026-02-14

## Goals
- Make signed-in state obvious in the main header.
- Replace ambiguous post-login state with clear avatar-based account UI.
- Provide quick account actions from header menu.

## Scope
- Show profile avatar (Google avatar if available, otherwise initials).
- Add dropdown with user email, `Write a question`, and `Sign out`.
- Keep current public navigation and visual style.

## Constraints and Decisions
- Header auth state source: browser Supabase session.
- Avatar priority: `user_metadata.avatar_url` first, initials fallback.
- Menu items (MVP): email display + `Write a question` + `Sign out`.
- Session behavior note: access token is short-lived (~1h), refresh keeps user signed in.

## Recommended Approach
Use client-side session subscription directly in header.

Why:
- Current login flow already relies on browser session state.
- Immediate UI updates after sign-in and sign-out.
- Minimal complexity relative to adding server-side sync layer.

## Component Architecture
- `src/components/SiteHeader.tsx`
  - Become client-aware for auth status.
  - Render avatar trigger when signed in.
  - Render existing CTA when signed out.

- `src/components/AuthMenu.tsx` (new)
  - Controlled dropdown menu.
  - Content:
    - User email (read-only line)
    - Link: `/board/new`
    - Action: Sign out

- `src/lib/session-user.ts` (new helper)
  - Map Supabase user to UI-safe shape:
    - `email`
    - `avatarUrl`
    - `initial`

## State and Behavior
- On header mount:
  - call `supabase.auth.getUser()` for initial state.
- Subscribe with `supabase.auth.onAuthStateChange`:
  - `SIGNED_IN`: show avatar/menu.
  - `SIGNED_OUT`: show signed-out header state.
- Sign-out:
  - call `supabase.auth.signOut()`.
  - close dropdown and refresh header state.

## Accessibility and Interaction
- Avatar trigger uses `aria-haspopup="menu"` and `aria-expanded`.
- Menu closes on outside click and Escape.
- Keyboard tab navigation supported for menu items.
- Avatar image uses descriptive alt text.

## Responsive Behavior
- Compact circular avatar trigger for mobile.
- Right-aligned dropdown with constrained width.
- Preserve existing nav readability and spacing.

## Testing Strategy
Behavior-focused tests only (avoid brittle presence-only checks).

- `src/lib/session-user.test.ts`
  - avatar URL mapping
  - initials fallback mapping

- `src/components/SiteHeader.test.tsx`
  - signed-out branch shows CTA
  - signed-in branch shows avatar/menu trigger

- Optional focused tests for menu action callbacks (sign-out)

## Done Criteria
- Signed-in users can clearly identify login status from header avatar.
- Dropdown shows email, `Write a question`, and `Sign out`.
- Sign-out returns header to signed-out state without confusion.
- Works on desktop and mobile without layout regressions.
