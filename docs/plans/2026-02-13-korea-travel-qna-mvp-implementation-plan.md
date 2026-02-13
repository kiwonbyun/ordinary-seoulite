# Korea Travel Q&A MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimal, low-cost Q&A + DM + tips + gallery site for first-time Korea travelers, optimized for question/DM starts.

**Architecture:** Next.js App Router with server components for read paths and route handlers for write paths. Supabase provides auth, Postgres, and storage; Stripe Checkout handles optional tips. Validation is centralized in zod schemas; UI uses Tailwind with a custom typographic theme.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase (Auth/Postgres/Storage), Stripe Checkout, Zod, Vitest + Testing Library.

---

## Skills
- @test-driven-development

### Task 0: Install dependencies (one-time)

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install required packages**

```bash
pnpm add zod stripe @supabase/supabase-js
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add runtime and test dependencies"
```

---

### Task 1: Add test tooling + env validation

**Files:**

- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`
- Create: `src/lib/env.ts`
- Create: `src/lib/env.test.ts`
- Create: `.env.local.example`

**Step 1: Write the failing test**

```ts
// src/lib/env.test.ts
import { describe, expect, it } from "vitest";
import { validatePublicEnv, validateServerEnv } from "./env";

describe("validateEnv", () => {
  it("throws when required server env vars are missing", () => {
    expect(() => validateServerEnv({})).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("returns normalized env when required vars exist", () => {
    const server = validateServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(server.supabaseUrl).toBe("https://example.supabase.co");

    const client = validatePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(client.supabaseAnonKey).toBe("anon");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/env.test.ts`
Expected: FAIL with module not found for `./env`.

**Step 3: Write minimal implementation**

```ts
// src/lib/env.ts
export type RawEnv = Record<string, string | undefined>;

type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  siteUrl: string;
};

type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
};

const serverRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const publicRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateServerEnv(raw: RawEnv): ServerEnv {
  for (const key of serverRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: raw.SUPABASE_SERVICE_ROLE_KEY!,
    stripeSecretKey: raw.STRIPE_SECRET_KEY!,
    stripeWebhookSecret: raw.STRIPE_WEBHOOK_SECRET!,
    siteUrl: raw.NEXT_PUBLIC_SITE_URL!,
  };
}

export function validatePublicEnv(raw: RawEnv): PublicEnv {
  for (const key of publicRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    siteUrl: raw.NEXT_PUBLIC_SITE_URL!,
  };
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
  },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

```json
// package.json (scripts)
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

```env
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/env.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json src/lib/env.ts src/lib/env.test.ts .env.local.example
git commit -m "chore: add test tooling and env validation"
```

---

### Task 2: Add Supabase clients and auth helpers

**Files:**

- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth.test.ts`

**Step 1: Write the failing test**

```ts
// src/lib/auth.test.ts
import { describe, expect, it } from "vitest";
import { canPost, canUploadGallery, canReply } from "./auth";

describe("auth helpers", () => {
  it("blocks anonymous users", () => {
    expect(canPost(null)).toBe(false);
  });

  it("allows operator to upload gallery", () => {
    expect(canUploadGallery({ id: "1", role: "mod" })).toBe(true);
  });

  it("allows verified to reply", () => {
    expect(canReply({ id: "2", role: "verified" })).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/lib/auth.test.ts`
Expected: FAIL with module not found for `./auth`.

**Step 3: Write minimal implementation**

```ts
// src/lib/auth.ts
export type UserRole = "user" | "verified" | "mod";
export type AuthUser = { id: string; role: UserRole } | null;

export function canPost(user: AuthUser) {
  return Boolean(user);
}

export function canReply(user: AuthUser) {
  return Boolean(user && (user.role === "verified" || user.role === "mod"));
}

export function canUploadGallery(user: AuthUser) {
  return Boolean(user && user.role === "mod");
}
```

```ts
// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";
import { validateServerEnv } from "@/lib/env";

const env = validateServerEnv(process.env);

export function createServerSupabase() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
```

```ts
// src/lib/supabase/browser.ts
import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "@/lib/env";

const env = validatePublicEnv(process.env);

export function createBrowserSupabase() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/auth.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts src/lib/supabase/server.ts src/lib/supabase/browser.ts
git commit -m "feat: add auth helpers and supabase clients"
```

---

### Task 3: Define Supabase schema + RLS policies

**Files:**

- Create: `supabase/schema.sql`
- Create: `supabase/schema.test.ts`

**Step 1: Write the failing test**

```ts
// supabase/schema.test.ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const schema = readFileSync("supabase/schema.sql", "utf-8");

describe("supabase schema", () => {
  it("creates core tables", () => {
    expect(schema).toMatch(/create table if not exists board_posts/i);
    expect(schema).toMatch(/create table if not exists dm_threads/i);
    expect(schema).toMatch(/create table if not exists gallery_photos/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- supabase/schema.test.ts`
Expected: FAIL with ENOENT for `supabase/schema.sql`.

**Step 3: Write minimal implementation**

```sql
-- supabase/schema.sql
create table if not exists users (
  id uuid primary key,
  display_name text,
  photo_url text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id),
  title text not null,
  body text not null,
  location_tag text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references board_posts(id),
  author_id uuid references users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  assigned_responder_id uuid references users(id),
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references dm_threads(id),
  sender_id uuid references users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references users(id),
  image_url text not null,
  caption text,
  location_tag text,
  created_at timestamptz default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  context_type text not null,
  context_id uuid not null,
  amount integer not null,
  currency text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id),
  context_type text not null,
  context_id uuid not null,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists moderation_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  reason text not null,
  created_at timestamptz default now()
);

-- RLS policies (outline)
-- Enable RLS per table in Supabase and add policies for:
-- 1) Public read on board_posts, board_replies, gallery_photos
-- 2) Authenticated insert on board_posts, dm_threads, dm_messages, reports
-- 3) Only role=mod can insert gallery_photos
-- 4) Only role=verified/mod can insert board_replies
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- supabase/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add supabase/schema.sql supabase/schema.test.ts
git commit -m "docs: add supabase schema and rls outline"
```

---

### Task 4: App shell, typography, and layout

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/SiteFooter.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/SiteHeader.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/components/SiteHeader.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteHeader from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the primary CTA", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /dm a question/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/components/SiteHeader.test.tsx`
Expected: FAIL with module not found for `./SiteHeader`.

**Step 3: Write minimal implementation**

```tsx
// src/components/Button.tsx
import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export default function Button({ href, children, variant = "primary" }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-neutral-800"
      : "border border-neutral-300 text-neutral-800 hover:border-neutral-500";
  return (
    <Link className={`${base} ${styles}`} href={href}>
      {children}
    </Link>
  );
}
```

```tsx
// src/components/SiteHeader.tsx
import Link from "next/link";
import Button from "./Button";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="text-lg font-semibold">Ordinary Seoulite</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/board">Board</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/profile">About</Link>
        <Button href="/dm">DM a question</Button>
      </nav>
    </header>
  );
}
```

```tsx
// src/components/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 py-6 text-xs text-neutral-500">
      Ordinary Seoulite · Seoul, Korea · 24h response target
    </footer>
  );
}
```

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const body = Work_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Ordinary Seoulite — Ask a local about Korea",
  description: "Ask a Seoul local, get answers within 24 hours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-5xl px-6">
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
```

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --font-display: "Playfair Display", serif;
  --font-body: "Work Sans", sans-serif;
}

body {
  font-family: var(--font-body);
}

h1, h2, h3 {
  font-family: var(--font-display);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/components/SiteHeader.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/components/Button.tsx src/components/SiteHeader.test.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add app shell and typography"
```

---

### Task 5: Validation schemas for inputs

**Files:**

- Create: `src/lib/validation/board.ts`
- Create: `src/lib/validation/dm.ts`
- Create: `src/lib/validation/tip.ts`
- Create: `src/lib/validation/report.ts`
- Create: `src/lib/validation/board.test.ts`

**Step 1: Write the failing test**

```ts
// src/lib/validation/board.test.ts
import { describe, expect, it } from "vitest";
import { boardPostSchema } from "./board";

describe("boardPostSchema", () => {
  it("rejects empty title/body", () => {
    const result = boardPostSchema.safeParse({ title: "", body: "" });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/lib/validation/board.test.ts`
Expected: FAIL with module not found for `./board`.

**Step 3: Write minimal implementation**

```ts
// src/lib/validation/board.ts
import { z } from "zod";

export const boardPostSchema = z.object({
  title: z.string().min(6).max(120),
  body: z.string().min(20).max(2000),
  locationTag: z.string().optional(),
});

export const boardReplySchema = z.object({
  body: z.string().min(5).max(1500),
});
```

```ts
// src/lib/validation/dm.ts
import { z } from "zod";

export const dmThreadSchema = z.object({
  message: z.string().min(10).max(2000),
});

export const dmMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});
```

```ts
// src/lib/validation/tip.ts
import { z } from "zod";

export const tipSchema = z.object({
  amount: z.number().int().min(1).max(200),
  currency: z.string().min(3).max(3),
  contextType: z.enum(["board", "dm"]),
  contextId: z.string().uuid(),
});
```

```ts
// src/lib/validation/report.ts
import { z } from "zod";

export const reportSchema = z.object({
  contextType: z.enum(["board", "dm", "gallery"]),
  contextId: z.string().uuid(),
  reason: z.string().min(4).max(500),
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/validation/board.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/validation/board.ts src/lib/validation/dm.ts src/lib/validation/tip.ts src/lib/validation/report.ts src/lib/validation/board.test.ts
git commit -m "feat: add input validation schemas"
```

---

### Task 6: Landing page + marketing content

**Files:**

- Modify: `src/app/page.tsx`
- Create: `src/app/page.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/app/page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Landing page", () => {
  it("highlights the 24h response promise", () => {
    render(<Page />);
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/app/page.test.tsx`
Expected: FAIL with missing text.

**Step 3: Write minimal implementation**

```tsx
// src/app/page.tsx
import Button from "@/components/Button";

export default function Page() {
  return (
    <section className="py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Seoul, Korea</p>
      <h1 className="mt-4 text-4xl font-semibold">
        Ask a local in Seoul — get answers within 24 hours.
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-700">
        I am a regular person living in Seoul. Ask about food, neighborhoods, etiquette,
        or the small details that make your first trip feel easy.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/dm">DM a question</Button>
        <Button href="/board" variant="ghost">Browse questions</Button>
      </div>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: add landing page copy and CTA"
```

---

### Task 7: Public board (list + detail)

**Files:**

- Create: `src/app/board/page.tsx`
- Create: `src/app/board/[postId]/page.tsx`
- Create: `src/lib/board.ts`
- Create: `src/lib/board.test.ts`

**Step 1: Write the failing test**

```ts
// src/lib/board.test.ts
import { describe, expect, it } from "vitest";
import { formatBoardStatus } from "./board";

describe("formatBoardStatus", () => {
  it("maps open to Open", () => {
    expect(formatBoardStatus("open")).toBe("Open");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/lib/board.test.ts`
Expected: FAIL with module not found for `./board`.

**Step 3: Write minimal implementation**

```ts
// src/lib/board.ts
export type BoardPost = {
  id: string;
  title: string;
  body: string;
  locationTag?: string | null;
  status: "open" | "answered";
};

export function formatBoardStatus(status: BoardPost["status"]) {
  return status === "answered" ? "Answered" : "Open";
}
```

```tsx
// src/app/board/page.tsx
import Link from "next/link";
import { formatBoardStatus, type BoardPost } from "@/lib/board";

const demoPosts: BoardPost[] = [
  {
    id: "demo-1",
    title: "First trip to Seoul: where should I stay?",
    body: "...",
    locationTag: "Seoul",
    status: "open",
  },
];

export default function BoardPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">Public Questions</h1>
      <div className="mt-6 space-y-4">
        {demoPosts.map((post) => (
          <Link key={post.id} href={`/board/${post.id}`} className="block rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{post.locationTag}</p>
            <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{formatBoardStatus(post.status)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/app/board/[postId]/page.tsx
export default function BoardDetailPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">Question Details</h1>
      <p className="mt-4 text-neutral-600">Content will be loaded from Supabase.</p>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/board.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/board.ts src/lib/board.test.ts src/app/board/page.tsx src/app/board/[postId]/page.tsx
git commit -m "feat: add public board skeleton"
```

---

### Task 8: DM page skeleton + response promise

**Files:**

- Create: `src/app/dm/page.tsx`
- Create: `src/app/dm/page.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/app/dm/page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("DM page", () => {
  it("mentions response within 24 hours", () => {
    render(<Page />);
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/app/dm/page.test.tsx`
Expected: FAIL with missing text.

**Step 3: Write minimal implementation**

```tsx
// src/app/dm/page.tsx
export default function DMPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">Private DM</h1>
      <p className="mt-4 text-neutral-700">
        Ask privately and receive a response within 24 hours. Tips are optional.
      </p>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/app/dm/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/dm/page.tsx src/app/dm/page.test.tsx
git commit -m "feat: add dm page skeleton"
```

---

### Task 9: Gallery page skeleton

**Files:**

- Create: `src/app/gallery/page.tsx`
- Create: `src/app/gallery/page.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/app/gallery/page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Gallery page", () => {
  it("renders a gallery heading", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /gallery/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/app/gallery/page.test.tsx`
Expected: FAIL with missing heading.

**Step 3: Write minimal implementation**

```tsx
// src/app/gallery/page.tsx
export default function GalleryPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">Gallery</h1>
      <p className="mt-4 text-neutral-600">Photos uploaded by the operator.</p>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/app/gallery/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/gallery/page.tsx src/app/gallery/page.test.tsx
git commit -m "feat: add gallery page skeleton"
```

---

### Task 10: Profile page skeleton

**Files:**

- Create: `src/app/profile/page.tsx`
- Create: `src/app/profile/page.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/app/profile/page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Profile page", () => {
  it("renders an about heading", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/app/profile/page.test.tsx`
Expected: FAIL with missing heading.

**Step 3: Write minimal implementation**

```tsx
// src/app/profile/page.tsx
export default function ProfilePage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="mt-4 text-neutral-700">
        A regular person living in Seoul. Real photo, real experiences, no hype.
      </p>
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/app/profile/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/profile/page.tsx src/app/profile/page.test.tsx
git commit -m "feat: add profile page skeleton"
```

---

### Task 11: Stripe Checkout endpoint (skeleton)

**Files:**

- Create: `src/app/api/tips/checkout/route.ts`
- Create: `src/lib/stripe.ts`
- Create: `src/lib/stripe.test.ts`

**Step 1: Write the failing test**

```ts
// src/lib/stripe.test.ts
import { describe, expect, it } from "vitest";
import { tipPresets } from "./stripe";

describe("tip presets", () => {
  it("includes three tiers", () => {
    expect(tipPresets.length).toBe(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/lib/stripe.test.ts`
Expected: FAIL with module not found for `./stripe`.

**Step 3: Write minimal implementation**

```ts
// src/lib/stripe.ts
export const tipPresets = [5, 10, 20];
```

```ts
// src/app/api/tips/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { validateServerEnv } from "@/lib/env";

const env = validateServerEnv(process.env);
const stripe = new Stripe(env.stripeSecretKey);

export async function POST(req: Request) {
  const body = await req.json();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: body.currency || "usd",
          unit_amount: body.amount * 100,
          product_data: { name: "Thank you tip" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.siteUrl}/tips/success`,
    cancel_url: `${env.siteUrl}/tips/cancel`,
  });
  return NextResponse.json({ url: session.url });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/stripe.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/stripe.ts src/lib/stripe.test.ts src/app/api/tips/checkout/route.ts
git commit -m "feat: add stripe checkout skeleton"
```

---

### Task 12: Vercel functions region config

**Files:**

- Create: `vercel.json`
- Create: `src/lib/vercel.test.ts`

**Step 1: Write the failing test**

```ts
// src/lib/vercel.test.ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync("vercel.json", "utf-8"));

describe("vercel config", () => {
  it("sets function region to iad1", () => {
    expect(JSON.stringify(config)).toMatch(/iad1/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- src/lib/vercel.test.ts`
Expected: FAIL with ENOENT for `vercel.json`.

**Step 3: Write minimal implementation**

```json
// vercel.json
{
  "functions": {
    "app/api/**": {
      "regions": ["iad1"]
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- src/lib/vercel.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add vercel.json src/lib/vercel.test.ts
git commit -m "chore: set vercel function region"
```

---

## Manual Configuration Checklist

- Supabase: enable RLS and apply `supabase/schema.sql` in SQL editor.
- Auth providers: configure Google + Apple OAuth.
- Storage: create bucket for gallery photos.
- Stripe: set webhook endpoint and secret; configure currency display.
- Vercel: add environment variables from `.env.local.example`.

---

## Test Commands Summary

- `pnpm test:run`
- `pnpm lint`
- `pnpm build`

---

## Release Checklist

- Seed content: 3-5 demo questions + 10-20 photos.
- Verify landing CTA -> DM page.
- Verify board list/detail loads.
- Verify Stripe Checkout redirect.
- Verify page load on mobile.
