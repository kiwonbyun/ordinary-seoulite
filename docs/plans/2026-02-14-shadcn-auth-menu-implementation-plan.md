# Shadcn Auth Menu Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add shadcn/ui as the frontend UI foundation and migrate the header auth dropdown to shadcn primitives while preserving existing behavior.

**Architecture:** Introduce `ui/*` primitives (`dropdown-menu`, `avatar`, `button`) with a shared `cn` helper, map styles to existing sunset tokens, then replace custom AuthMenu internals with shadcn-based components. Keep `SiteHeader` auth logic and always-visible DM CTA behavior.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4, shadcn/ui (Radix), Vitest.

---

### Task 1: Add shadcn Foundation Utilities

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Create `src/lib/utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/utils.test.ts`
Expected: FAIL because helper/deps do not exist.

**Step 3: Write minimal implementation**

- Add dependencies:
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
  - `@radix-ui/react-dropdown-menu`
- Implement helper:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: add shadcn utility foundation"
```

### Task 2: Add shadcn UI Primitives

**Files:**
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/avatar.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/dropdown-menu.test.tsx`

**Step 1: Write the failing test**

Create minimal rendering/open-close behavior test for dropdown primitive.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/ui/dropdown-menu.test.tsx`
Expected: FAIL before component creation.

**Step 3: Write minimal implementation**

- Add shadcn-style wrappers around Radix components.
- Map classes to existing sunset token classes.
- Keep implementation small and reusable.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/ui/dropdown-menu.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx src/components/ui/avatar.tsx src/components/ui/button.tsx src/components/ui/dropdown-menu.test.tsx
git commit -m "feat: add shadcn ui primitives"
```

### Task 3: Migrate AuthMenu to shadcn Dropdown

**Files:**
- Modify: `src/components/AuthMenu.tsx`
- Modify: `src/components/AuthMenu.test.tsx`

**Step 1: Write the failing test**

Add behavior assertions for:
- click opens menu
- hover assist opens menu on desktop-like pointer path
- sign out handler called

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/AuthMenu.test.tsx`
Expected: FAIL before migration behavior is complete.

**Step 3: Write minimal implementation**

- Replace custom absolute menu with `DropdownMenu` primitives.
- Use shadcn `Avatar` trigger.
- Preserve menu items: email, `/board/new`, sign out.
- Add desktop hover assist without breaking click behavior.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/AuthMenu.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/AuthMenu.tsx src/components/AuthMenu.test.tsx
git commit -m "feat: migrate auth menu to shadcn dropdown"
```

### Task 4: Keep Header Behavior Stable

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteHeader.test.tsx`

**Step 1: Write the failing test**

Ensure signed-in state still keeps `DM a question` visible alongside avatar menu.

**Step 2: Run test to verify it fails (if regression introduced)**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx`
Expected: FAIL if behavior regressed.

**Step 3: Write minimal implementation**

- Ensure `SiteHeader` renders DM CTA always.
- Ensure AuthMenu renders only when signed in.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/SiteHeader.tsx src/components/SiteHeader.test.tsx
git commit -m "fix: preserve dm cta with shadcn auth menu"
```

### Task 5: Document Stack Update

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

No test required for docs-only change.

**Step 2: Write minimal implementation**

Add frontend stack note:
- shadcn/ui now part of design system
- `ui/*` primitives are migration target for reusable components

**Step 3: Run checks**

Run:
- `pnpm test:run`
- `pnpm exec tsc --noEmit`

Expected: PASS

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add shadcn to frontend design stack"
```

### Task 6: Final Validation

**Files:**
- No additional file changes required

**Step 1: Full test run**

Run: `pnpm test:run`
Expected: PASS

**Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 3: Lint**

Run: `pnpm lint`
Expected: PASS or documented unrelated pre-existing failures.
