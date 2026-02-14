# Seoul Sunset Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply a Seoul sunset visual theme across the app with subtle global styling and stronger landing-page emphasis, while preserving readability and accessibility.

**Architecture:** Introduce CSS design tokens and reusable semantic utility/component classes in `globals.css`, then wire pages/components to those classes instead of hardcoded neutral Tailwind tokens. Keep the strongest visual treatment in landing hero only. Add focused tests that verify new theme hooks/classes render as expected.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4 (`@import "tailwindcss"`), Vitest + Testing Library.

---

### Task 1: Add Sunset Design Tokens And Reusable Theme Classes

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/app/theme-tokens.test.ts`

**Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

describe("sunset theme tokens", () => {
  it("defines core sunset tokens", () => {
    expect(css).toMatch(/--bg-base:/);
    expect(css).toMatch(/--bg-surface:/);
    expect(css).toMatch(/--text-primary:/);
    expect(css).toMatch(/--accent-warm:/);
    expect(css).toMatch(/--accent-rose:/);
    expect(css).toMatch(/--accent-deep:/);
  });

  it("defines reduced-motion handling", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/theme-tokens.test.ts`
Expected: FAIL because token names do not exist yet.

**Step 3: Write minimal implementation**

```css
@import "tailwindcss";

:root {
  --font-display: "Playfair Display", serif;
  --font-body: "Work Sans", sans-serif;

  --bg-base: #f6efe8;
  --bg-surface: #fff8f2;
  --bg-elevated: #fffdfb;
  --text-primary: #1f2330;
  --text-secondary: #4a4f5f;
  --text-inverse: #fffaf4;
  --border-soft: #e7d9cc;
  --border-strong: #ccb7a4;
  --accent-warm: #dd7a4e;
  --accent-rose: #c76575;
  --accent-deep: #2c3f63;
}

body {
  font-family: var(--font-body);
  color: var(--text-primary);
  background:
    radial-gradient(1200px 600px at 10% -10%, color-mix(in srgb, var(--accent-warm) 22%, transparent), transparent 60%),
    radial-gradient(900px 500px at 90% -20%, color-mix(in srgb, var(--accent-rose) 18%, transparent), transparent 62%),
    linear-gradient(180deg, #fffaf5 0%, var(--bg-base) 100%);
}

h1,
h2,
h3 {
  font-family: var(--font-display);
}

.theme-surface {
  background-color: color-mix(in srgb, var(--bg-surface) 88%, white);
  border: 1px solid var(--border-soft);
}

.sunset-hero {
  background:
    linear-gradient(130deg, color-mix(in srgb, var(--accent-warm) 58%, white) 0%, color-mix(in srgb, var(--accent-rose) 52%, white) 42%, color-mix(in srgb, var(--accent-deep) 52%, #0f1523) 100%);
  animation: sunsetDrift 30s ease-in-out infinite alternate;
}

@keyframes sunsetDrift {
  from { background-position: 0% 50%; }
  to { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .sunset-hero {
    animation: none;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/theme-tokens.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/globals.css src/app/theme-tokens.test.ts
git commit -m "feat: add global seoul sunset theme tokens"
```

### Task 2: Apply Global Theme Shell In Root Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/layout.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RootLayout from "./layout";

describe("RootLayout theme shell", () => {
  it("renders a themed main shell wrapper", () => {
    render(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    );

    const shell = screen.getByTestId("site-shell");
    expect(shell.className).toMatch(/theme-surface/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/layout.test.tsx`
Expected: FAIL because `data-testid="site-shell"` and class are missing.

**Step 3: Write minimal implementation**

```tsx
<body className="min-h-screen text-[color:var(--text-primary)]">
  <div
    data-testid="site-shell"
    className="theme-surface mx-auto my-4 max-w-5xl rounded-3xl px-6 shadow-[0_10px_30px_rgba(31,35,48,0.08)]"
  >
    <SiteHeader />
    <main className="min-h-[60vh]">{children}</main>
    <SiteFooter />
  </div>
</body>
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/layout.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/layout.test.tsx
git commit -m "feat: apply themed layout shell"
```

### Task 3: Theme Header, Footer, And Button Variants

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `src/components/Button.tsx`
- Modify: `src/components/SiteHeader.test.tsx`
- Create: `src/components/Button.test.tsx`

**Step 1: Write the failing tests**

```tsx
// src/components/SiteHeader.test.tsx (add case)
it("uses sunset header surface class", () => {
  render(<SiteHeader />);
  expect(screen.getByTestId("site-header").className).toMatch(/sunset-header/);
});
```

```tsx
// src/components/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("applies primary class names", () => {
    render(<Button href="/dm">DM</Button>);
    expect(screen.getByRole("link", { name: "DM" }).className).toMatch(/btn-primary/);
  });

  it("applies ghost class names", () => {
    render(
      <Button href="/board" variant="ghost">
        Board
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Board" }).className).toMatch(/btn-ghost/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx src/components/Button.test.tsx`
Expected: FAIL because themed classes/test IDs do not exist.

**Step 3: Write minimal implementation**

```tsx
// src/components/SiteHeader.tsx
<header data-testid="site-header" className="sunset-header flex items-center justify-between py-6">
```

```tsx
// src/components/SiteFooter.tsx
<footer className="mt-16 border-t border-[color:var(--border-soft)] py-6 text-xs text-[color:var(--text-secondary)]">
```

```tsx
// src/components/Button.tsx
const base = "btn inline-flex items-center justify-center rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-rose)]";
const styles = variant === "primary" ? "btn-primary" : "btn-ghost";
```

```css
/* add in globals.css */
.sunset-header {
  background-color: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid color-mix(in srgb, var(--border-soft) 70%, transparent);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-deep), color-mix(in srgb, var(--accent-rose) 35%, var(--accent-deep)));
  color: var(--text-inverse);
}

.btn-primary:hover {
  filter: brightness(1.06);
}

.btn-ghost {
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  background-color: color-mix(in srgb, var(--bg-elevated) 78%, transparent);
}

.btn-ghost:hover {
  border-color: var(--accent-rose);
  color: color-mix(in srgb, var(--accent-rose) 70%, var(--text-primary));
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/SiteHeader.test.tsx src/components/Button.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/components/Button.tsx src/components/SiteHeader.test.tsx src/components/Button.test.tsx src/app/globals.css
git commit -m "feat: theme header footer and button variants"
```

### Task 4: Add Landing Hero Emphasis With Subtle Motion

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Landing page", () => {
  it("renders the sunset hero container", () => {
    render(<Page />);
    expect(screen.getByTestId("landing-hero").className).toMatch(/sunset-hero/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: FAIL because hero test id/class are missing.

**Step 3: Write minimal implementation**

```tsx
export default function Page() {
  return (
    <section data-testid="landing-hero" className="sunset-hero relative overflow-hidden rounded-3xl px-6 py-14 text-[color:var(--text-inverse)] shadow-[0_20px_50px_rgba(31,35,48,0.2)]">
      <p className="text-xs uppercase tracking-[0.3em] text-white/80">Seoul, Korea</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">
        Ask a local in Seoul - get answers within 24 hours.
      </h1>
      <p className="mt-4 max-w-2xl text-white/85">
        I am a regular person living in Seoul. Ask about food, neighborhoods, etiquette,
        or the small details that make your first trip feel easy.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/dm">DM a question</Button>
        <Button href="/board" variant="ghost">
          Browse questions
        </Button>
      </div>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: add sunset hero treatment to landing page"
```

### Task 5: Theme Interior Surfaces And Run Full Regression

**Files:**
- Modify: `src/app/board/page.tsx`
- Modify: `src/app/dm/page.tsx`
- Modify: `src/app/gallery/page.tsx`
- Modify: `src/app/profile/page.tsx`
- Test: `src/app/dm/page.test.tsx`
- Test: `src/app/gallery/page.test.tsx`
- Test: `src/app/profile/page.test.tsx`

**Step 1: Write the failing test**

Add one class assertion per page test:

```tsx
const section = screen.getByTestId("dm-page");
expect(section.className).toMatch(/theme-surface/);
```

(Repeat equivalent for gallery/profile with `data-testid="gallery-page"`, `data-testid="profile-page"`.)

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/dm/page.test.tsx src/app/gallery/page.test.tsx src/app/profile/page.test.tsx`
Expected: FAIL because test IDs and classes are missing.

**Step 3: Write minimal implementation**

Example page shell pattern:

```tsx
<section data-testid="dm-page" className="theme-surface rounded-3xl px-6 py-10 shadow-[0_8px_24px_rgba(31,35,48,0.06)]">
```

Also adjust board list card classes away from neutral border values:

```tsx
className="theme-surface block rounded-2xl p-5 transition-colors hover:border-[color:var(--border-strong)]"
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/dm/page.test.tsx src/app/gallery/page.test.tsx src/app/profile/page.test.tsx`
Expected: PASS

Then run full suite:

Run: `pnpm test:run`
Expected: PASS all tests.

**Step 5: Commit**

```bash
git add src/app/board/page.tsx src/app/dm/page.tsx src/app/gallery/page.tsx src/app/profile/page.tsx src/app/dm/page.test.tsx src/app/gallery/page.test.tsx src/app/profile/page.test.tsx
git commit -m "feat: apply sunset theme to interior pages"
```

### Task 6: Final QA And Documentation Sync

**Files:**
- Modify: `README.md` (short style note)

**Step 1: Write the failing test**

No code test required; QA checklist is the gate.

**Step 2: Run verification checks**

Run:
- `pnpm lint`
- `pnpm test:run`
- `pnpm build`

Expected: all commands succeed.

**Step 3: Write minimal implementation**

Add concise README section:

```md
## Design System

This project uses a Seoul sunset theme token system in `src/app/globals.css`.
Landing page uses stronger hero treatment; interior pages use lower-intensity surfaces.
```

**Step 4: Re-run checks**

Run:
- `pnpm lint`
- `pnpm test:run`
- `pnpm build`

Expected: all commands succeed.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document sunset theme system"
```
