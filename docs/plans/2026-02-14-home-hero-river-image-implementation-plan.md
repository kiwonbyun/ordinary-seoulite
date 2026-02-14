# Home Hero River Image Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the home hero with responsive river imagery (`main-image.webp` desktop, `jong-ro.webp` mobile) while preserving readability and CTA clarity.

**Architecture:** Keep existing landing hero structure and test hooks, switch to art-directed responsive image background with strong gradient overlays, and maintain existing CTA/copy hierarchy.

**Tech Stack:** Next.js App Router, React, Tailwind v4, existing sunset token CSS.

---

### Task 1: Add Landing Hero Background Utility Classes

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/landing-hero-style.test.ts`

**Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

describe("landing hero image styles", () => {
  it("defines desktop and mobile hero image classes", () => {
    expect(css).toMatch(/\.landing-hero-media/);
    expect(css).toMatch(/main-image\.webp/);
    expect(css).toMatch(/jong-ro\.webp/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/landing-hero-style.test.ts`
Expected: FAIL before class exists.

**Step 3: Write minimal implementation**

Add classes in `globals.css`:
- desktop background image for hero media
- media query at `max-width: 768px` for mobile image
- strong overlay classes for readability

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/landing-hero-style.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/globals.css src/app/landing-hero-style.test.ts
git commit -m "feat: add responsive landing hero image styles"
```

### Task 2: Apply Responsive Hero Structure in Home Page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Step 1: Write the failing test**

Add test asserting hero media node and overlay hooks exist:

```tsx
it("renders responsive hero media hooks", () => {
  render(<Page />);
  expect(screen.getByTestId("landing-hero-media")).toBeInTheDocument();
  expect(screen.getByTestId("landing-hero-overlay")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: FAIL before hooks are added.

**Step 3: Write minimal implementation**

- Keep root section and existing content.
- Add absolute hero media div using new CSS class.
- Add overlay layer div.
- Keep text and CTAs above overlays.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: apply river image hero to landing page"
```

### Task 3: Visual Regression Guard for CTA Readability Hooks

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Write the failing test**

If needed, add assertion for content container z-index/readability class hook in `page.test.tsx`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: FAIL until hook/class exists.

**Step 3: Write minimal implementation**

- Ensure content wrapper has explicit foreground layer class (`relative z-10`).
- Ensure CTA container remains unchanged semantically.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "fix: preserve landing content readability over hero image"
```

### Task 4: Full Validation

**Files:**
- No additional file changes required

**Step 1: Run full test suite**

Run: `pnpm test:run`
Expected: PASS

**Step 2: Run type-check**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

**Step 3: Commit final polish (if needed)**

```bash
git add <changed-files>
git commit -m "chore: finalize responsive hero image rollout"
```
