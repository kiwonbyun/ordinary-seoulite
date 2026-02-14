# Board Auth Redirect Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement protected board write entry so anonymous users are redirected to login and returned to intended page after Google OAuth.

**Architecture:** Add a dedicated redirect-sanitizing helper, wire a protected `/board/new` server page gate, add login and callback routes for Supabase Google OAuth, and keep behavior-focused tests around redirect and auth branching. Avoid brittle UI-only presence tests.

**Tech Stack:** Next.js App Router, TypeScript, Supabase JS, Vitest.

---

### Task 1: Add Redirect Sanitization Helper

**Files:**
- Create: `src/lib/auth-redirect.ts`
- Create: `src/lib/auth-redirect.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolveRedirectTarget } from "./auth-redirect";

describe("resolveRedirectTarget", () => {
  it("accepts internal absolute paths", () => {
    expect(resolveRedirectTarget("/board/new")).toBe("/board/new");
  });

  it("falls back on external urls", () => {
    expect(resolveRedirectTarget("https://evil.com", "/")).toBe("/");
  });

  it("falls back on empty values", () => {
    expect(resolveRedirectTarget(undefined, "/")).toBe("/");
  });

  it("rejects protocol-relative urls", () => {
    expect(resolveRedirectTarget("//evil.com", "/")).toBe("/");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/auth-redirect.test.ts`
Expected: FAIL because helper does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function resolveRedirectTarget(input: string | null | undefined, fallback = "/") {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/auth-redirect.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/auth-redirect.ts src/lib/auth-redirect.test.ts
git commit -m "feat: add safe redirect target resolver"
```

### Task 2: Add Protected Board Write Page Gate

**Files:**
- Create: `src/app/board/new/page.tsx`
- Create: `src/lib/session-gate.ts`
- Create: `src/lib/session-gate.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getBoardNewRedirectPath } from "./session-gate";

describe("getBoardNewRedirectPath", () => {
  it("returns login redirect for anonymous users", () => {
    expect(getBoardNewRedirectPath(null)).toBe("/login?redirectTo=%2Fboard%2Fnew");
  });

  it("returns null for authenticated users", () => {
    expect(getBoardNewRedirectPath({ id: "u1" })).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/session-gate.test.ts`
Expected: FAIL because helper does not exist.

**Step 3: Write minimal implementation**

```ts
export function getBoardNewRedirectPath(user: { id: string } | null) {
  if (!user) return "/login?redirectTo=%2Fboard%2Fnew";
  return null;
}
```

Then wire in page:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getBoardNewRedirectPath } from "@/lib/session-gate";

export default async function BoardNewPage() {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const to = getBoardNewRedirectPath(data.user ? { id: data.user.id } : null);
  if (to) redirect(to);

  return <section>...</section>;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/session-gate.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/board/new/page.tsx src/lib/session-gate.ts src/lib/session-gate.test.ts
git commit -m "feat: guard board write page behind login"
```

### Task 3: Add Login Page With Google OAuth And Redirect Persistence

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/LoginClient.tsx`
- Create: `src/app/login/login-redirect.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolveRedirectTarget } from "@/lib/auth-redirect";

describe("login redirect defaults", () => {
  it("defaults to root for direct /login entry", () => {
    expect(resolveRedirectTarget(undefined, "/")).toBe("/");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/login/login-redirect.test.ts`
Expected: FAIL if file/helper wiring not present.

**Step 3: Write minimal implementation**

- `page.tsx`: read `searchParams.redirectTo`, sanitize via helper, pass to client.
- `LoginClient.tsx`: on click, call `createBrowserSupabase().auth.signInWithOAuth` with callback URL:
  - `${siteUrl}/auth/callback?redirectTo=${encodeURIComponent(safeRedirectTo)}`
- If already authenticated, server page redirects to safe target.
- Direct `/login` entry without `redirectTo` uses `/`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/login/login-redirect.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/login/LoginClient.tsx src/app/login/login-redirect.test.ts
git commit -m "feat: add google login page with redirect persistence"
```

### Task 4: Add OAuth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/callback/route.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolveRedirectTarget } from "@/lib/auth-redirect";

describe("callback redirect resolution", () => {
  it("uses internal redirect target", () => {
    expect(resolveRedirectTarget("/board/new", "/")).toBe("/board/new");
  });

  it("falls back for invalid redirect", () => {
    expect(resolveRedirectTarget("https://evil.com", "/")).toBe("/");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/auth/callback/route.test.ts`
Expected: FAIL before callback implementation exists.

**Step 3: Write minimal implementation**

- Parse `code` and `redirectTo` from request URL.
- Exchange code with Supabase auth.
- Resolve safe target with helper.
- Redirect success to safe target.
- Redirect failure/missing code to `/login`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/auth/callback/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/auth/callback/route.ts src/app/auth/callback/route.test.ts
git commit -m "feat: add oauth callback redirect handler"
```

### Task 5: Wire Board Page Write Entry And Run Regression

**Files:**
- Modify: `src/app/board/page.tsx`

**Step 1: Write the failing test**

No UI-presence-only test by request.

**Step 2: Run targeted behavioral tests**

Run:
- `pnpm vitest run src/lib/auth-redirect.test.ts`
- `pnpm vitest run src/lib/session-gate.test.ts`
- `pnpm vitest run src/app/auth/callback/route.test.ts`

Expected: PASS before final wiring commit.

**Step 3: Write minimal implementation**

- Add write-entry link/button in board page header to `/board/new`.

**Step 4: Run regression checks**

Run:
- `pnpm test:run`
- `pnpm lint`

Expected: PASS (or document existing unrelated failures).

**Step 5: Commit**

```bash
git add src/app/board/page.tsx
git commit -m "feat: add board write entry route"
```

### Task 6: Document Auth Redirect Flow

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

No test required for docs update.

**Step 2: Add minimal docs**

Add section describing:
- `/board/new` guard behavior
- `/login?redirectTo=...`
- `/auth/callback` completion
- direct `/login` default to `/`

**Step 3: Verify formatting and correctness**

Run: `pnpm lint` (optional for markdown workflow)
Expected: no new project lint regressions attributable to docs.

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: describe board login redirect flow"
```
