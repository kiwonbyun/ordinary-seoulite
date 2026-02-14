# Board New Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement real post creation on `/board/new` with required post type and successful publish redirect + toast feedback.

**Architecture:** Use a Server Action for validation + insert, keep editor UI simple with textarea, extend schema (`type`), and surface success feedback on `/board` using query flag.

**Tech Stack:** Next.js App Router, React, Supabase, Zod, Vitest.

---

### Task 1: Extend Board Validation With Required Post Type

**Files:**
- Modify: `src/lib/validation/board.ts`
- Modify: `src/lib/validation/board.test.ts`

**Step 1: Write the failing test**

Add tests for:
- valid `type` values pass
- missing `type` fails

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/validation/board.test.ts`
Expected: FAIL before schema update.

**Step 3: Write minimal implementation**

Add field:
```ts
type: z.enum(["question", "review", "tip"])
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/validation/board.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/validation/board.ts src/lib/validation/board.test.ts
git commit -m "feat: require board post type in validation"
```

### Task 2: Add DB Schema Support for Post Type

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/schema.test.ts`

**Step 1: Write the failing test**

Add assertion for `type` column presence/default in schema text.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run supabase/schema.test.ts`
Expected: FAIL before schema update.

**Step 3: Write minimal implementation**

Update `board_posts` table definition with:
- `type text not null default 'question'`
- optional check constraint for allowed values

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run supabase/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add supabase/schema.sql supabase/schema.test.ts
git commit -m "feat: add post type column to board posts schema"
```

### Task 3: Build Server Action for Post Creation

**Files:**
- Create: `src/app/(main)/board/new/actions.ts`
- Create: `src/app/(main)/board/new/actions.test.ts`

**Step 1: Write the failing test**

Add tests for action helper behavior:
- valid payload maps to DB insert shape
- invalid payload returns validation error

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run 'src/app/(main)/board/new/actions.test.ts'`
Expected: FAIL before action/helper exists.

**Step 3: Write minimal implementation**

- Parse `FormData`
- Validate via `boardPostSchema`
- Insert via Supabase client
- Return action state or redirect signal

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run 'src/app/(main)/board/new/actions.test.ts'`
Expected: PASS

**Step 5: Commit**

```bash
git add 'src/app/(main)/board/new/actions.ts' 'src/app/(main)/board/new/actions.test.ts'
git commit -m "feat: add board post creation server action"
```

### Task 4: Implement `/board/new` Editor Form UI

**Files:**
- Modify: `src/app/(main)/board/new/page.tsx`
- Create: `src/app/(main)/board/new/page.test.tsx`

**Step 1: Write the failing test**

Add tests that page includes:
- `type` select with default `question`
- `textarea` body field
- publish button

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run 'src/app/(main)/board/new/page.test.tsx'`
Expected: FAIL before form implementation.

**Step 3: Write minimal implementation**

- Render form with fields:
  - title
  - type(select default question)
  - locationTag
  - body textarea
- Hook submit to Server Action
- Render validation errors from action state

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run 'src/app/(main)/board/new/page.test.tsx'`
Expected: PASS

**Step 5: Commit**

```bash
git add 'src/app/(main)/board/new/page.tsx' 'src/app/(main)/board/new/page.test.tsx'
git commit -m "feat: build board new editor form"
```

### Task 5: Add Board Success Toast on Redirect Flag

**Files:**
- Modify: `src/app/(main)/board/page.tsx`
- Modify: `src/app/(main)/board/page.test.tsx`

**Step 1: Write the failing test**

Add test for success message when `searchParams.created === "1"`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run 'src/app/(main)/board/page.test.tsx'`
Expected: FAIL before toast logic exists.

**Step 3: Write minimal implementation**

- Accept `searchParams` in page props.
- Conditionally render success toast message.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run 'src/app/(main)/board/page.test.tsx'`
Expected: PASS

**Step 5: Commit**

```bash
git add 'src/app/(main)/board/page.tsx' 'src/app/(main)/board/page.test.tsx'
git commit -m "feat: show publish success toast on board page"
```

### Task 6: Full Validation

**Files:**
- No additional file changes required

**Step 1: Run all tests**

Run: `pnpm test:run`
Expected: PASS

**Step 2: Run type-check**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 3: Optional lint**

Run: `pnpm lint`
Expected: PASS or document unrelated pre-existing issues.
