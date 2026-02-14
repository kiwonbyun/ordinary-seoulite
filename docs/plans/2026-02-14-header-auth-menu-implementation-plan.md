# Header Auth Status Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a clear signed-in UX in the header with avatar + account dropdown and sign-out action.

**Architecture:** Keep auth state source in browser Supabase session, add a focused user-to-UI mapper utility, and introduce a small auth dropdown component consumed by `SiteHeader`. Use behavioral tests for mapping and signed-in/signed-out rendering branches.

**Tech Stack:** Next.js App Router, React client components, Supabase JS, Vitest + Testing Library.

---

### Task 1: Add Session User UI Mapper

**Files:**
- Create: `src/lib/session-user.ts`
- Create: `src/lib/session-user.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { toSessionUserView } from "./session-user";

describe("toSessionUserView", () => {
  it("uses avatar_url when present", () => {
    const view = toSessionUserView({
      email: "user@example.com",
      user_metadata: { avatar_url: "https://example.com/a.png" },
    } as never);

    expect(view.avatarUrl).toBe("https://example.com/a.png");
    expect(view.initial).toBe("U");
  });

  it("falls back to email initial", () => {
    const view = toSessionUserView({ email: "seoul@example.com", user_metadata: {} } as never);
    expect(view.avatarUrl).toBeNull();
    expect(view.initial).toBe("S");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/session-user.test.ts`
Expected: FAIL because helper does not exist.

**Step 3: Write minimal implementation**

```ts
export function toSessionUserView(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const email = user.email ?? "Signed-in user";
  const avatarRaw = user.user_metadata?.avatar_url;
  const avatarUrl = typeof avatarRaw === "string" ? avatarRaw : null;
  const initial = email.slice(0, 1).toUpperCase() || "U";

  return { email, avatarUrl, initial };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/session-user.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/session-user.ts src/lib/session-user.test.ts
git commit -m "feat: add session user view mapper"
```

### Task 2: Add Auth Dropdown Component

**Files:**
- Create: `src/components/AuthMenu.tsx`
- Create: `src/components/AuthMenu.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthMenu from "./AuthMenu";

describe("AuthMenu", () => {
  it("renders email and actions", () => {
    render(
      <AuthMenu
        email="user@example.com"
        initial="U"
        avatarUrl={null}
        onSignOut={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /account menu/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/AuthMenu.test.tsx`
Expected: FAIL because component does not exist.

**Step 3: Write minimal implementation**

- Add avatar trigger button.
- Toggle dropdown with email, link to `/board/new`, and sign-out button.
- Close on Escape and outside click.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/AuthMenu.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/AuthMenu.tsx src/components/AuthMenu.test.tsx
git commit -m "feat: add header auth dropdown component"
```

### Task 3: Wire Header Auth State

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteHeader.test.tsx`

**Step 1: Write the failing test**

Add behavioral branch test in `SiteHeader.test.tsx` for signed-in render path using mocked Supabase auth response.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx`
Expected: FAIL because header has no signed-in branch.

**Step 3: Write minimal implementation**

- Header subscribes to auth state via `createBrowserSupabase()`.
- If user exists: render `AuthMenu`.
- If not: render existing `DM a question` CTA.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/SiteHeader.tsx src/components/SiteHeader.test.tsx
git commit -m "feat: show auth status in header"
```

### Task 4: Add Session Duration UX Copy

**Files:**
- Modify: `src/app/login/LoginClient.tsx`

**Step 1: Write the failing test**

No brittle UI existence test required.

**Step 2: Write minimal implementation**

Add concise helper copy under login button:
- "Session access tokens rotate about hourly; you'll stay signed in with refresh."

**Step 3: Run focused regression tests**

Run:
- `pnpm vitest run src/components/SiteHeader.test.tsx`
- `pnpm vitest run src/components/AuthMenu.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
git add src/app/login/LoginClient.tsx
git commit -m "feat: add session duration note to login UI"
```

### Task 5: Full Validation

**Files:**
- No additional file changes required

**Step 1: Run full tests**

Run: `pnpm test:run`
Expected: PASS

**Step 2: Run type-check**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 3: Run lint (known repository caveats may apply)**

Run: `pnpm lint`
Expected: PASS or document unrelated pre-existing lint failures.

**Step 4: Commit final polish (if needed)**

```bash
git add <changed-files>
git commit -m "chore: finalize header auth status UX"
```
