# Editorial 404 Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal editorial-style custom 404 page while preserving existing top navigation.

**Architecture:** Use TanStack Router root-level `notFoundComponent` to render a dedicated `NotFoundRoute` component inside the existing `RootLayout` outlet.

**Tech Stack:** React 19, TanStack Router, Tailwind CSS, Vitest + Testing Library

---

### Task 1: Add failing test for unknown route

**Files:**
- Create: `src/app/router.not-found.test.tsx`

1. Write a test that navigates to an unknown path.
2. Assert custom 404-specific copy appears.
3. Run `pnpm test:run src/app/router.not-found.test.tsx` and verify it fails first.

### Task 2: Implement custom not-found route component

**Files:**
- Create: `src/app/routes/not-found.tsx`
- Modify: `src/app/router.tsx`

1. Create minimal editorial 404 UI component with two recovery links.
2. Register component via root route `notFoundComponent`.
3. Run route test again and verify pass.

### Task 3: Regression check

**Files:**
- No code changes expected

1. Run targeted app shell test to ensure no regression: `pnpm test:run src/app/App.shell.test.tsx`.
2. Confirm both tests pass.
