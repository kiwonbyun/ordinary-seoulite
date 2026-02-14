# OAuth State Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove legacy hash-token login handling and enforce OAuth `state` validation for Google sign-in callback.

**Architecture:** Keep a single server-centric auth flow: `/auth/start` creates one-time `state` in an HttpOnly cookie, `/auth/callback` verifies query-state against cookie before exchanging code for session, then clears state cookie. Delete the legacy `/auth/session` token-ingest path and simplify `LoginClient` to a pure redirect launcher.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Supabase JS, Vitest, React Testing Library

---

### Task 1: Add OAuth State Utilities

**Skills:** @test-driven-development

**Files:**
- Create: `src/lib/oauth-state.test.ts`
- Create: `src/lib/oauth-state.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { OAUTH_STATE_COOKIE, createOAuthState, verifyOAuthState } from "./oauth-state";

describe("oauth-state", () => {
  it("creates a non-empty state value", () => {
    const state = createOAuthState();
    expect(state.length).toBeGreaterThanOrEqual(32);
  });

  it("verifies equal states", () => {
    const state = "abc123";
    expect(verifyOAuthState(state, state)).toBe(true);
  });

  it("rejects missing or different states", () => {
    expect(verifyOAuthState("", "abc")).toBe(false);
    expect(verifyOAuthState("abc", "")).toBe(false);
    expect(verifyOAuthState("abc", "xyz")).toBe(false);
  });

  it("exports stable cookie metadata", () => {
    expect(OAUTH_STATE_COOKIE).toBe("os-oauth-state");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/lib/oauth-state.test.ts`
Expected: FAIL with module not found for `./oauth-state`.

**Step 3: Write minimal implementation**

```ts
import { randomBytes, timingSafeEqual } from "crypto";

export const OAUTH_STATE_COOKIE = "os-oauth-state";
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

export function createOAuthState() {
  return randomBytes(24).toString("base64url");
}

export function verifyOAuthState(expected: string | null, actual: string | null) {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/lib/oauth-state.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/oauth-state.ts src/lib/oauth-state.test.ts
git commit -m "feat: add oauth state utility"
```

### Task 2: Add State Cookie + Query State in Auth Start Route

**Skills:** @test-driven-development

**Files:**
- Create: `src/app/auth/start/route.test.ts`
- Modify: `src/app/auth/start/route.ts`
- Use: `src/lib/oauth-state.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("auth start route", () => {
  it("redirects to provider authorize URL with state", async () => {
    const req = new Request("http://localhost:3000/auth/start?redirectTo=/board/new");
    const response = await GET(req);
    const location = response.headers.get("location");

    expect(location).toContain("/auth/v1/authorize");
    expect(location).toContain("response_type=code");
    expect(location).toContain("state=");
  });

  it("sets oauth state cookie", async () => {
    const req = new Request("http://localhost:3000/auth/start?redirectTo=/board/new");
    const response = await GET(req);
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(cookie).toContain("os-oauth-state=");
    expect(cookie.toLowerCase()).toContain("httponly");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/auth/start/route.test.ts`
Expected: FAIL because state is not present and cookie is not set.

**Step 3: Write minimal implementation**

```ts
const state = createOAuthState();
authorizeUrl.searchParams.set("state", state);

const response = NextResponse.redirect(authorizeUrl);
response.cookies.set(OAUTH_STATE_COOKIE, state, {
  httpOnly: true,
  sameSite: "lax",
  secure: env.siteUrl.startsWith("https://"),
  path: "/",
  maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
});

return response;
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/auth/start/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/auth/start/route.ts src/app/auth/start/route.test.ts src/lib/oauth-state.ts
git commit -m "feat: set oauth state cookie in auth start"
```

### Task 3: Enforce State Validation in Callback Route

**Skills:** @test-driven-development

**Files:**
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/app/auth/callback/route.test.ts`
- Use: `src/lib/oauth-state.ts`

**Step 1: Write the failing test**

```ts
it("redirects to login when state is missing or mismatched", async () => {
  const req = new Request(
    "http://localhost:3000/auth/callback?code=abc&state=wrong&redirectTo=/board/new",
    { headers: { cookie: "os-oauth-state=expected" } },
  );

  const response = await GET(req);
  const location = response.headers.get("location") ?? "";

  expect(location).toContain("/login");
  expect(location).toContain("redirectTo=%2Fboard%2Fnew");
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/auth/callback/route.test.ts`
Expected: FAIL because callback currently does not validate state.

**Step 3: Write minimal implementation**

```ts
const callbackState = url.searchParams.get("state");
const cookieState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? null;
const stateValid = verifyOAuthState(cookieState, callbackState);

if (!code || !stateValid) {
  const failResponse = NextResponse.redirect(new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl));
  failResponse.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return failResponse;
}

// success branch
response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/auth/callback/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/auth/callback/route.ts src/app/auth/callback/route.test.ts
git commit -m "feat: validate oauth state in callback"
```

### Task 4: Remove Legacy Hash Session Flow from Login Client

**Skills:** @test-driven-development

**Files:**
- Modify: `src/app/(auth)/login/LoginClient.tsx`
- Modify: `src/app/(auth)/login/LoginClient.test.tsx`

**Step 1: Write/adjust failing test**

```ts
it("renders continue with google link to auth start", () => {
  render(<LoginClient redirectTo="/board/new" />);
  expect(screen.getByRole("link", { name: /continue with google/i })).toHaveAttribute(
    "href",
    "/auth/start?redirectTo=%2Fboard%2Fnew",
  );
});
```

**Step 2: Run test to verify baseline**

Run: `pnpm test:run src/app/(auth)/login/LoginClient.test.tsx`
Expected: PASS before refactor.

**Step 3: Write minimal implementation**

```tsx
// remove useEffect, loading, errorMessage, /auth/session fetch
// keep static link CTA
<Link href={startUrl} className="btn-primary ...">
  Continue with Google
</Link>
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/(auth)/login/LoginClient.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(auth)/login/LoginClient.tsx src/app/(auth)/login/LoginClient.test.tsx
git commit -m "refactor: remove legacy hash token login flow"
```

### Task 5: Delete Unused Auth Session Route

**Skills:** @test-driven-development

**Files:**
- Delete: `src/app/auth/session/route.ts`
- Modify (if needed): `src/app/auth/session/*` tests or references

**Step 1: Write safety check (grep-based) as failing expectation in review checklist**

```bash
rg -n "/auth/session" src
```

Expected before deletion: at least one hit from `LoginClient.tsx` or route file.

**Step 2: Remove implementation**

Delete: `src/app/auth/session/route.ts`

**Step 3: Run reference check**

Run: `rg -n "/auth/session" src`
Expected: no runtime references remain.

**Step 4: Run targeted auth tests**

Run: `pnpm test:run src/app/auth/start/route.test.ts src/app/auth/callback/route.test.ts src/app/(auth)/login/LoginClient.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add -A src/app/auth/session/route.ts src/app/(auth)/login/LoginClient.tsx src/app/auth
git commit -m "chore: remove obsolete auth session endpoint"
```

### Task 6: Final Verification

**Skills:** @test-driven-development

**Files:**
- Verify: `src/app/auth/start/route.ts`
- Verify: `src/app/auth/callback/route.ts`
- Verify: `src/app/(auth)/login/LoginClient.tsx`
- Verify: `src/lib/oauth-state.ts`

**Step 1: Run focused auth test suite**

Run: `pnpm test:run src/lib/oauth-state.test.ts src/app/auth/start/route.test.ts src/app/auth/callback/route.test.ts src/app/(auth)/login/LoginClient.test.tsx`
Expected: PASS

**Step 2: Run full test suite smoke**

Run: `pnpm test:run`
Expected: PASS or known unrelated failures only.

**Step 3: Run lint on touched files (optional but recommended)**

Run: `pnpm lint`
Expected: no new lint errors from modified files.

**Step 4: Create integration sanity checklist**

```text
- /login?redirectTo=/board/new -> Continue with Google 클릭
- callback URL has code+state
- state mismatch scenario returns /login redirect
- success scenario sets auth cookies and lands on /board/new
```

**Step 5: Commit (if verification-only changes exist)**

```bash
git add <any verification doc updates>
git commit -m "test: verify oauth state validation flow"
```
