# Community MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the community-first MVP with Home, Board, DM, Gallery, and Tip flows for English-speaking users.

**Architecture:** Client-first SPA using TanStack Router + TanStack Query and Supabase direct access for standard CRUD. Sensitive or privileged operations are constrained by RLS and moved to server/edge only when needed.

**Tech Stack:** Vite, React, TypeScript, TailwindCSS, shadcn/ui, axios, TanStack Query, TanStack Router, Supabase, Vitest.

---

### Task 1: Finalize route skeleton for MVP menus

**Files:**
- Modify: `src/app/router.tsx`
- Create: `src/app/routes/dm.tsx`
- Create: `src/app/routes/gallery.tsx`
- Test: `src/features/auth/hooks.test.ts`

**Step 1: Write the failing test**
```ts
// Add/adjust test to assert protected-route helper behavior
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/auth/hooks.test.ts`
Expected: FAIL due to missing new guard behavior

**Step 3: Write minimal implementation**
```tsx
// Add DM/Gallery routes and menu links
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/auth/hooks.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/router.tsx src/app/routes/dm.tsx src/app/routes/gallery.tsx src/features/auth/hooks.test.ts
git commit -m "feat: add dm and gallery route skeleton"
```

### Task 2: Implement board list + filter + search behavior

**Files:**
- Modify: `src/features/board/hooks.ts`
- Modify: `src/features/board/api.ts`
- Modify: `src/app/routes/board.tsx`
- Test: `src/features/board/hooks.test.tsx`
- Test: `src/features/board/api.test.ts`

**Step 1: Write the failing test**
```ts
// Assert query key behavior for tag/search params and stable cache updates
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/hooks.test.tsx src/features/board/api.test.ts`
Expected: FAIL for missing query param/filter mapping

**Step 3: Write minimal implementation**
```ts
// Add optional filter params and map API rows accordingly
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/hooks.test.tsx src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/hooks.ts src/features/board/api.ts src/app/routes/board.tsx src/features/board/hooks.test.tsx src/features/board/api.test.ts
git commit -m "feat: add board search and tag filter"
```

### Task 3: Add board detail route with DM and Tip CTA

**Files:**
- Create: `src/app/routes/board-detail.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/features/board/api.ts`
- Test: `src/features/board/api.test.ts`

**Step 1: Write the failing test**
```ts
// Add API test for fetch-by-id behavior
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: FAIL for missing detail fetch

**Step 3: Write minimal implementation**
```tsx
// Detail screen with status badge, DM CTA, Tip CTA
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/routes/board-detail.tsx src/app/router.tsx src/features/board/api.ts src/features/board/api.test.ts
git commit -m "feat: add board detail route"
```

### Task 4: Implement DM single-thread feature (auth only)

**Files:**
- Create: `src/features/dm/types.ts`
- Create: `src/features/dm/api.ts`
- Create: `src/features/dm/hooks.ts`
- Modify: `src/app/routes/dm.tsx`
- Test: `src/features/dm/hooks.test.tsx`
- Test: `src/features/dm/api.test.ts`

**Step 1: Write the failing test**
```ts
// Assert optimistic message send and rollback on failure
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/dm/hooks.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**
```ts
// Implement single-thread fetch/send hooks
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/dm/hooks.test.tsx src/features/dm/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/dm src/app/routes/dm.tsx
git commit -m "feat: add dm single-thread flow"
```

### Task 5: Implement gallery read + admin-write guard wiring

**Files:**
- Create: `src/features/gallery/types.ts`
- Create: `src/features/gallery/api.ts`
- Create: `src/features/gallery/hooks.ts`
- Modify: `src/app/routes/gallery.tsx`
- Test: `src/features/gallery/api.test.ts`
- Test: `src/features/auth/hooks.test.ts`

**Step 1: Write the failing test**
```ts
// Assert role-based write guard helper for admin-only uploads
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/gallery/api.test.ts src/features/auth/hooks.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```ts
// Public read hook + admin upload branch guard
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/gallery/api.test.ts src/features/auth/hooks.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/gallery src/app/routes/gallery.tsx src/features/auth/hooks.test.ts
git commit -m "feat: add gallery read flow and admin guard"
```

### Task 6: Add tip flow state model and entry points

**Files:**
- Create: `src/features/tip/types.ts`
- Create: `src/features/tip/api.ts`
- Create: `src/features/tip/hooks.ts`
- Modify: `src/app/routes/board-detail.tsx`
- Modify: `src/app/routes/dm.tsx`
- Test: `src/features/tip/hooks.test.tsx`
- Test: `src/features/tip/api.test.ts`

**Step 1: Write the failing test**
```ts
// Assert tip mutation state transitions: pending -> success/failure
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/tip/hooks.test.tsx src/features/tip/api.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```ts
// Mutation hooks for create tip intent and status mapping
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/tip/hooks.test.tsx src/features/tip/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/tip src/app/routes/board-detail.tsx src/app/routes/dm.tsx
git commit -m "feat: add tip flow hooks and cta wiring"
```

### Task 7: Align Supabase schema and RLS policies with MVP scope

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/policies.sql`
- Modify: `docs/supabase-rls-checklist.md`

**Step 1: Write the failing test**
```ts
// SQL checklist-based manual validation entries for policy matrix
```

**Step 2: Run test to verify it fails**
Run: `echo "Manual RLS audit: expected policy matrix not fully matched"`
Expected: Gaps identified

**Step 3: Write minimal implementation**
```sql
-- Add dm, gallery, tips tables and strict policies
```

**Step 4: Run test to verify it passes**
Run: `echo "Manual RLS audit: all matrix items satisfied"`
Expected: Pass checklist

**Step 5: Commit**
```bash
git add supabase/schema.sql supabase/policies.sql docs/supabase-rls-checklist.md
git commit -m "feat: align supabase schema and rls for community mvp"
```

### Task 8: QA pass for MVP-critical behaviors

**Files:**
- Modify: `src/features/board/hooks.test.tsx`
- Create: `src/features/dm/hooks.test.tsx`
- Create: `src/features/tip/hooks.test.tsx`
- Modify: `README.md`

**Step 1: Write the failing test**
```ts
// Add regression tests for optimistic rollback and auth-required actions
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run`
Expected: FAIL with new regressions

**Step 3: Write minimal implementation**
```ts
// Fix logic and document runbook in README
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run && pnpm build`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features README.md
git commit -m "test: lock mvp-critical behavior and docs"
```
