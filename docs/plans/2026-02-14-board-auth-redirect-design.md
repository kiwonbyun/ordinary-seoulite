# Board Write Entry Auth Redirect Design

Date: 2026-02-14

## Goals
- Add a write-entry flow from the public board list to a protected write page.
- If the user is not logged in, redirect to login and preserve intended destination.
- After successful login, return user to intended page safely.

## Scope
- Add write button on board list page.
- Add `/board/new` protected page skeleton.
- Add `/login` page for Google OAuth initiation.
- Add `/auth/callback` route for OAuth code exchange and redirect completion.

## Constraints and Decisions
- Auth provider: Supabase Google OAuth.
- Redirect persistence method: query parameter (`redirectTo`).
- Protected destination for write entry: `/board/new`.
- If user directly enters `/login` without `redirectTo`, default post-login destination is `/`.
- UI-existence-only tests are excluded by request.

## Recommended Approach
Use page-level guards with callback route handling.

Why:
- Minimal moving parts for current app state.
- Works naturally with Next.js App Router server redirects.
- Easy to reason about login intent and callback completion.

## Architecture
- `src/app/board/page.tsx`
  - Add write-entry link to `/board/new`.

- `src/app/board/new/page.tsx`
  - Server-side auth gate.
  - If no session: redirect to `/login?redirectTo=/board/new`.
  - If session exists: show write form skeleton.

- `src/app/login/page.tsx`
  - Google OAuth trigger.
  - Build callback URL: `/auth/callback?redirectTo=<validated>`.
  - If already logged in and `redirectTo` exists/valid: redirect there.
  - If already logged in and no `redirectTo`: redirect to `/`.

- `src/app/auth/callback/route.ts`
  - Exchange OAuth code for session.
  - Resolve safe redirect target from query.
  - On success, redirect to target.
  - On failure/missing code, redirect to `/login` or fallback `/`.

- `src/lib/auth-redirect.ts` (new helper)
  - `resolveRedirectTarget(input: string | null | undefined, fallback = "/")`
  - Allow only internal absolute paths starting with `/`.
  - Block protocol-relative and external URLs.

## Security
- Prevent open redirect by strict internal-path allowlist logic.
- Never redirect to raw user-provided external URLs.
- Normalize invalid/empty `redirectTo` to `/`.

## Error Handling
- Missing or invalid callback code: safe redirect to `/login`.
- Code exchange failure: safe fallback route, no crash.
- Invalid `redirectTo`: fallback `/`.

## Testing Strategy
Exclude brittle UI-presence-only tests.

Keep focused behavior tests:
- `src/lib/auth-redirect.test.ts`
  - Valid internal path accepted.
  - Invalid/external path rejected to fallback.
  - Empty input falls back to `/`.

- `src/app/auth/callback/route.test.ts`
  - Success path redirects to validated `redirectTo`.
  - Missing/failed code uses fallback.
  - Malicious `redirectTo` is ignored.

- Auth gate behavior tests for `/board/new` path logic via extracted helper/unit-friendly function if needed.

## Done Criteria
- Board has write entry to `/board/new`.
- Anonymous users hitting `/board/new` are redirected to `/login?redirectTo=/board/new`.
- Login success returns to intended internal path.
- Direct `/login` without `redirectTo` returns to `/` after login.
- Redirect logic prevents external URL redirects.
