# Board Image Attachments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add board post image attachments with thumbnail-first card rendering and fallback to `main.jpg`.

**Architecture:** Store post text in `board_posts` and attachment metadata in `board_post_images`, upload binaries to Supabase Storage bucket `board-post-images`, and expose card thumbnails by selecting first image (`position=0`) or fallback asset.

**Tech Stack:** Vite, React, TypeScript, Supabase JS, Supabase Storage, TanStack Query, shadcn/ui, Vitest.

---

### Task 1: Add image validation utility

**Files:**
- Create: `src/features/board/image-validation.ts`
- Create: `src/features/board/image-validation.test.ts`

**Step 1: Write the failing test**
```ts
import { validateBoardImages } from "./image-validation";

test("rejects more than 4 files", () => {
  const result = validateBoardImages(new Array(5).fill(new File(["x"], "a.jpg", { type: "image/jpeg" })) as File[]);
  expect(result.success).toBe(false);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/image-validation.test.ts`
Expected: FAIL (module missing)

**Step 3: Write minimal implementation**
```ts
export function validateBoardImages(files: File[]) {
  // validate count/type/size
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/image-validation.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/image-validation.ts src/features/board/image-validation.test.ts
git commit -m "feat: add board image validation utility"
```

### Task 2: Extend board schema and policy for image metadata

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/policies.sql`
- Modify: `docs/supabase-rls-checklist.md`

**Step 1: Write the failing test**
```ts
// checklist-driven manual validation note for board_post_images policy matrix
```

**Step 2: Run test to verify it fails**
Run: `echo "Manual check: board_post_images table/policies missing"`
Expected: missing entries identified

**Step 3: Write minimal implementation**
```sql
create table board_post_images (...);
-- add select public + owner-only write policies
```

**Step 4: Run test to verify it passes**
Run: `echo "Manual check: board_post_images matrix satisfied"`
Expected: pass

**Step 5: Commit**
```bash
git add supabase/schema.sql supabase/policies.sql docs/supabase-rls-checklist.md
git commit -m "feat: add board_post_images schema and rls"
```

### Task 3: Add board image upload and metadata API helpers

**Files:**
- Modify: `src/features/board/types.ts`
- Modify: `src/features/board/api.ts`
- Modify: `src/features/board/api.test.ts`

**Step 1: Write the failing test**
```ts
// test upload metadata mapping and thumbnail fallback behavior
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: FAIL for missing image handling

**Step 3: Write minimal implementation**
```ts
// add createBoardPostWithImages and board list mapping with thumbnailUrl
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/types.ts src/features/board/api.ts src/features/board/api.test.ts
git commit -m "feat: add board image upload and metadata api"
```

### Task 4: Update board creation hook for post+image sequence

**Files:**
- Modify: `src/features/board/hooks.ts`
- Modify: `src/features/board/hooks.test.tsx`

**Step 1: Write the failing test**
```ts
// test mutation rollback when image upload sequence fails
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/hooks.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**
```ts
// mutation accepts files, runs create post then image uploads, handles rollback
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/hooks.test.tsx`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/hooks.ts src/features/board/hooks.test.tsx
git commit -m "feat: support board post creation with images"
```

### Task 5: Build write form image picker UX

**Files:**
- Modify: `src/app/routes/board.tsx`
- Create: `src/features/board/image-preview.ts`
- Test: `src/features/board/image-validation.test.ts`

**Step 1: Write the failing test**
```ts
// validation test for mixed file types and oversized files
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/image-validation.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```tsx
// add file input, preview/count text, error feedback, pass files into mutation
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/image-validation.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/routes/board.tsx src/features/board/image-preview.ts src/features/board/image-validation.test.ts
git commit -m "feat: add board write image picker"
```

### Task 6: Render board list as thumbnail cards with fallback

**Files:**
- Modify: `src/app/routes/board.tsx`
- Modify: `src/features/board/types.ts`
- Modify: `src/features/board/api.ts`

**Step 1: Write the failing test**
```ts
// API mapping test expects fallback thumbnail when no image exists
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```tsx
// card list with thumbnail image src from first image or main.jpg
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/routes/board.tsx src/features/board/types.ts src/features/board/api.ts src/features/board/api.test.ts
git commit -m "feat: render board thumbnail cards with fallback image"
```

### Task 7: Show attached images on board detail page

**Files:**
- Modify: `src/app/routes/board-detail.tsx`
- Modify: `src/features/board/api.ts`
- Modify: `src/features/board/api.test.ts`

**Step 1: Write the failing test**
```ts
// detail fetch test expects ordered image list by position
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**
```tsx
// render ordered image gallery in detail page
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/routes/board-detail.tsx src/features/board/api.ts src/features/board/api.test.ts
git commit -m "feat: render board detail images"
```

### Task 8: Final verification and docs touch-up

**Files:**
- Modify: `README.md`
- Modify: `docs/supabase-rls-checklist.md`

**Step 1: Write the failing test**
```ts
// no new code test; rely on full suite + build gate
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run`
Expected: fail if any regression remains

**Step 3: Write minimal implementation**
```md
// update docs for board image attachment constraints and flow
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run && pnpm build`
Expected: PASS

**Step 5: Commit**
```bash
git add README.md docs/supabase-rls-checklist.md
git commit -m "docs: finalize board image attachment notes"
```
