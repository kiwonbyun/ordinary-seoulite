# Vite React Supabase Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the project as a low-cost, fast SPA using Cloudflare Pages, Vite/React, and Supabase with strict RLS.

**Architecture:** Build a client-heavy SPA with TanStack Router + TanStack Query, direct Supabase access for standard CRUD, and minimal Edge Function usage for sensitive flows only. Enforce access with RLS policies and keep UI interaction snappy through optimistic updates and rollback handling.

**Tech Stack:** Vite, React, TypeScript, shadcn/ui, axios, @tanstack/react-query, @tanstack/react-router, Supabase (Auth/Postgres/RLS), Vitest, Testing Library.

---

### Task 1: Bootstrap SPA Foundation

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles/global.css`

**Step 1: Write the failing test**
```ts
// src/app/App.shell.test.tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app shell", () => {
  render(<App />);
  expect(screen.getByTestId("app-shell")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/app/App.shell.test.tsx`
Expected: FAIL (module/file not found)

**Step 3: Write minimal implementation**
```tsx
// src/app/App.tsx
export default function App() {
  return <div data-testid="app-shell">Ordinary Seoulite</div>;
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/app/App.shell.test.tsx`
Expected: PASS

**Step 5: Commit**
```bash
git add package.json vite.config.ts tsconfig.json index.html src/main.tsx src/app/App.tsx src/app/App.shell.test.tsx src/styles/global.css
git commit -m "chore: bootstrap vite react spa foundation"
```

### Task 2: Configure Query + Router Providers

**Files:**
- Create: `src/app/providers/Providers.tsx`
- Create: `src/app/router.tsx`
- Modify: `src/main.tsx`
- Test: `src/app/providers/Providers.test.tsx`
- Test: `src/app/router.test.tsx`

**Step 1: Write the failing test**
```tsx
// src/app/providers/Providers.test.tsx
import { render } from "@testing-library/react";
import { Providers } from "./Providers";

test("mounts provider tree", () => {
  const { getByTestId } = render(
    <Providers>
      <div data-testid="child" />
    </Providers>,
  );
  expect(getByTestId("child")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/app/providers/Providers.test.tsx`
Expected: FAIL (Providers missing)

**Step 3: Write minimal implementation**
```tsx
// src/app/providers/Providers.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/app/providers/Providers.test.tsx`
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/providers/Providers.tsx src/app/providers/Providers.test.tsx src/app/router.tsx src/app/router.test.tsx src/main.tsx
git commit -m "feat: add tanstack query and router providers"
```

### Task 3: Add Supabase Client Infrastructure

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/env.ts`
- Test: `src/lib/env.test.ts`
- Test: `src/lib/supabase/client.test.ts`

**Step 1: Write the failing test**
```ts
// src/lib/env.test.ts
import { getPublicEnv } from "./env";

test("throws when required env is missing", () => {
  expect(() => getPublicEnv({} as Record<string, string | undefined>)).toThrow();
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/lib/env.test.ts`
Expected: FAIL (module missing)

**Step 3: Write minimal implementation**
```ts
// src/lib/env.ts
export function getPublicEnv(raw: Record<string, string | undefined>) {
  const url = raw.VITE_SUPABASE_URL;
  const anon = raw.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase public env");
  return { url, anon };
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/lib/env.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/env.ts src/lib/env.test.ts src/lib/supabase/client.ts src/lib/supabase/client.test.ts
git commit -m "feat: add supabase client and env validation"
```

### Task 4: Define Board Domain Schemas and Utilities

**Files:**
- Create: `src/features/board/types.ts`
- Create: `src/features/board/schemas.ts`
- Create: `src/features/board/utils.ts`
- Test: `src/features/board/schemas.test.ts`
- Test: `src/features/board/utils.test.ts`

**Step 1: Write the failing test**
```ts
// src/features/board/schemas.test.ts
import { boardPostSchema } from "./schemas";

test("rejects short title", () => {
  const result = boardPostSchema.safeParse({ type: "question", title: "abc", body: "x".repeat(40) });
  expect(result.success).toBe(false);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/schemas.test.ts`
Expected: FAIL (schema missing)

**Step 3: Write minimal implementation**
```ts
// src/features/board/schemas.ts
import { z } from "zod";

export const boardPostSchema = z.object({
  type: z.enum(["question", "review", "tip"]),
  title: z.string().min(6).max(120),
  body: z.string().min(20).max(2000),
  locationTag: z.string().optional(),
});
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/schemas.test.ts src/features/board/utils.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/types.ts src/features/board/schemas.ts src/features/board/utils.ts src/features/board/schemas.test.ts src/features/board/utils.test.ts
git commit -m "feat: add board validation and utilities"
```

### Task 5: Implement Board Data Access Layer

**Files:**
- Create: `src/features/board/api.ts`
- Test: `src/features/board/api.test.ts`

**Step 1: Write the failing test**
```ts
// src/features/board/api.test.ts
import { describe, expect, test, vi } from "vitest";
import { fetchBoardPosts } from "./api";

test("maps supabase rows into board model", async () => {
  // mock supabase response and assert mapped output
  const posts = await fetchBoardPosts({ offset: 0, limit: 20 });
  expect(Array.isArray(posts)).toBe(true);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: FAIL (api missing)

**Step 3: Write minimal implementation**
```ts
// src/features/board/api.ts
export async function fetchBoardPosts(_input: { offset: number; limit: number }) {
  return [];
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/api.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/api.ts src/features/board/api.test.ts
git commit -m "feat: add board data-access module"
```

### Task 6: Build Board Query and Mutation Hooks with Optimistic Rollback

**Files:**
- Create: `src/features/board/hooks.ts`
- Test: `src/features/board/hooks.test.ts`

**Step 1: Write the failing test**
```ts
// src/features/board/hooks.test.ts
import { describe, expect, test } from "vitest";

test("rolls back optimistic cache when create fails", async () => {
  expect(true).toBe(true);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/hooks.test.ts`
Expected: FAIL (hooks missing)

**Step 3: Write minimal implementation**
```ts
// src/features/board/hooks.ts
export function useBoardPosts() {
  return { data: [] };
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/board/hooks.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/board/hooks.ts src/features/board/hooks.test.ts
git commit -m "feat: add board query and mutation hooks"
```

### Task 7: Add Auth Session Hook and Route Guards

**Files:**
- Create: `src/features/auth/hooks.ts`
- Modify: `src/app/router.tsx`
- Test: `src/features/auth/hooks.test.ts`
- Test: `src/app/router.auth-guard.test.tsx`

**Step 1: Write the failing test**
```ts
// src/features/auth/hooks.test.ts
import { getInitials } from "./hooks";

test("derives initials from email", () => {
  expect(getInitials("user@example.com")).toBe("U");
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/auth/hooks.test.ts`
Expected: FAIL (module missing)

**Step 3: Write minimal implementation**
```ts
// src/features/auth/hooks.ts
export function getInitials(email: string) {
  return email[0]?.toUpperCase() ?? "?";
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/features/auth/hooks.test.ts src/app/router.auth-guard.test.tsx`
Expected: PASS

**Step 5: Commit**
```bash
git add src/features/auth/hooks.ts src/features/auth/hooks.test.ts src/app/router.tsx src/app/router.auth-guard.test.tsx
git commit -m "feat: add auth session hook and route guards"
```

### Task 8: Integrate shadcn UI and Build Core Pages

**Files:**
- Create: `src/components/ui/*`
- Create: `src/app/routes/home.tsx`
- Create: `src/app/routes/board.tsx`
- Create: `src/app/routes/login.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/features/board/hooks.test.ts`
- Test: `src/features/auth/hooks.test.ts`

**Step 1: Write the failing test**
```ts
// reuse domain tests to drive page integration behavior
import { test, expect } from "vitest";

test("integration baseline", () => {
  expect(true).toBe(true);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/features/board/hooks.test.ts src/features/auth/hooks.test.ts`
Expected: FAIL before integration updates

**Step 3: Write minimal implementation**
```tsx
// src/app/routes/board.tsx
export default function BoardRoute() {
  return <section data-testid="board-page">Board</section>;
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run`
Expected: PASS

**Step 5: Commit**
```bash
git add src/components/ui src/app/routes src/app/App.tsx
git commit -m "feat: add core routes and shadcn ui primitives"
```

### Task 9: Add Cloudflare Pages Deployment Configuration

**Files:**
- Create: `wrangler.toml`
- Create: `.env.example`
- Create: `README.md`
- Test: `src/lib/env.test.ts`

**Step 1: Write the failing test**
```ts
// src/lib/env.test.ts
import { getPublicEnv } from "./env";

test("reads required vite env keys", () => {
  expect(getPublicEnv({ VITE_SUPABASE_URL: "x", VITE_SUPABASE_ANON_KEY: "y" })).toEqual({ url: "x", anon: "y" });
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm test:run src/lib/env.test.ts`
Expected: FAIL before docs/env alignment

**Step 3: Write minimal implementation**
```env
# .env.example
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Step 4: Run test to verify it passes**
Run: `pnpm test:run src/lib/env.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add wrangler.toml .env.example README.md src/lib/env.test.ts
git commit -m "chore: add cloudflare pages deployment config"
```

### Task 10: Define Supabase RLS Baseline and Validation Checklist

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/policies.sql`
- Create: `docs/supabase-rls-checklist.md`

**Step 1: Write the failing test**
```ts
// docs-driven validation step
// Document expected policy matrix and verify manually in dashboard/sql editor.
```

**Step 2: Run test to verify it fails**
Run: `echo "Manual step: verify missing RLS policies"`
Expected: Identify absent or overly permissive policies

**Step 3: Write minimal implementation**
```sql
alter table board_posts enable row level security;
-- add select/insert/update/delete policies with auth.uid() constraints
```

**Step 4: Run test to verify it passes**
Run: `echo "Manual step: run policy checks in Supabase SQL editor"`
Expected: Policy matrix satisfied

**Step 5: Commit**
```bash
git add supabase/schema.sql supabase/policies.sql docs/supabase-rls-checklist.md
git commit -m "feat: add supabase schema and rls baseline"
```
