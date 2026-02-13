# 한국 여행 Q&A MVP 구현 계획서

> **Claude용:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**목표:** 한국 첫 방문 단기 여행자를 위해 질문/DM 시작에 최적화된 최소 비용 Q&A + DM + 팁 + 갤러리 사이트를 구축한다.

**아키텍처:** 읽기 경로는 서버 컴포넌트, 쓰기 경로는 라우트 핸들러로 구성한 Next.js App Router. Supabase가 Auth/Postgres/Storage를 제공하고 Stripe Checkout으로 선택 팁 결제를 처리한다. 검증은 zod 스키마로 중앙화하고 UI는 커스텀 타이포 테마의 Tailwind를 사용한다.

**기술 스택:** Next.js 16, React 19, Tailwind CSS 4, Supabase(Auth/Postgres/Storage), Stripe Checkout, Zod, Vitest + Testing Library.

---

## 스킬
- @test-driven-development

### 작업 0: 의존성 설치(1회)

**파일:**

- 수정: `package.json`
- 수정: `package-lock.json`

**Step 1: 필요한 패키지 설치**

```bash
pnpm add zod stripe @supabase/supabase-js
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

**Step 2: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: add runtime and test dependencies"
```

---

### 작업 1: 테스트 도구 추가 + 환경변수 검증

**파일:**

- 생성: `vitest.config.ts`
- 생성: `src/test/setup.ts`
- 수정: `package.json`
- 생성: `src/lib/env.ts`
- 생성: `src/lib/env.test.ts`
- 생성: `.env.local.example`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm vitest run src/lib/env.test.ts`
기대 결과: `./env` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/env.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add vitest.config.ts src/test/setup.ts package.json src/lib/env.ts src/lib/env.test.ts .env.local.example
git commit -m "chore: add test tooling and env validation"
```

---

### 작업 2: Supabase 클라이언트와 인증 헬퍼 추가

**파일:**

- 생성: `src/lib/supabase/server.ts`
- 생성: `src/lib/supabase/browser.ts`
- 생성: `src/lib/auth.ts`
- 생성: `src/lib/auth.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/lib/auth.test.ts`
기대 결과: `./auth` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/auth.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts src/lib/supabase/server.ts src/lib/supabase/browser.ts
git commit -m "feat: add auth helpers and supabase clients"
```

---

### 작업 3: Supabase 스키마 + RLS 정책 정의

**파일:**

- 생성: `supabase/schema.sql`
- 생성: `supabase/schema.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- supabase/schema.test.ts`
기대 결과: `supabase/schema.sql` ENOENT로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- supabase/schema.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add supabase/schema.sql supabase/schema.test.ts
git commit -m "docs: add supabase schema and rls outline"
```

---

### 작업 4: 앱 셸, 타이포그래피, 레이아웃

**파일:**

- 수정: `src/app/layout.tsx`
- 수정: `src/app/globals.css`
- 생성: `src/components/SiteHeader.tsx`
- 생성: `src/components/SiteFooter.tsx`
- 생성: `src/components/Button.tsx`
- 생성: `src/components/SiteHeader.test.tsx`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/components/SiteHeader.test.tsx`
기대 결과: `./SiteHeader` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/components/SiteHeader.test.tsx`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/components/SiteHeader.tsx src/components/SiteFooter.tsx src/components/Button.tsx src/components/SiteHeader.test.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add app shell and typography"
```

---

### 작업 5: 입력값 검증 스키마

**파일:**

- 생성: `src/lib/validation/board.ts`
- 생성: `src/lib/validation/dm.ts`
- 생성: `src/lib/validation/tip.ts`
- 생성: `src/lib/validation/report.ts`
- 생성: `src/lib/validation/board.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/lib/validation/board.test.ts`
기대 결과: `./board` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/validation/board.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/lib/validation/board.ts src/lib/validation/dm.ts src/lib/validation/tip.ts src/lib/validation/report.ts src/lib/validation/board.test.ts
git commit -m "feat: add input validation schemas"
```

---

### 작업 6: 랜딩 페이지 + 마케팅 카피

**파일:**

- 수정: `src/app/page.tsx`
- 생성: `src/app/page.test.tsx`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/app/page.test.tsx`
기대 결과: 텍스트 누락으로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/app/page.test.tsx`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: add landing page copy and CTA"
```

---

### 작업 7: 공개 게시판(리스트 + 상세)

**파일:**

- 생성: `src/app/board/page.tsx`
- 생성: `src/app/board/[postId]/page.tsx`
- 생성: `src/lib/board.ts`
- 생성: `src/lib/board.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/lib/board.test.ts`
기대 결과: `./board` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/board.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/lib/board.ts src/lib/board.test.ts src/app/board/page.tsx src/app/board/[postId]/page.tsx
git commit -m "feat: add public board skeleton"
```

---

### 작업 8: DM 페이지 골격 + 응답 약속

**파일:**

- 생성: `src/app/dm/page.tsx`
- 생성: `src/app/dm/page.test.tsx`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/app/dm/page.test.tsx`
기대 결과: 텍스트 누락으로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/app/dm/page.test.tsx`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/app/dm/page.tsx src/app/dm/page.test.tsx
git commit -m "feat: add dm page skeleton"
```

---

### 작업 9: 갤러리 페이지 골격

**파일:**

- 생성: `src/app/gallery/page.tsx`
- 생성: `src/app/gallery/page.test.tsx`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/app/gallery/page.test.tsx`
기대 결과: 제목 누락으로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/app/gallery/page.test.tsx`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/app/gallery/page.tsx src/app/gallery/page.test.tsx
git commit -m "feat: add gallery page skeleton"
```

---

### 작업 10: 프로필 페이지 골격

**파일:**

- 생성: `src/app/profile/page.tsx`
- 생성: `src/app/profile/page.test.tsx`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/app/profile/page.test.tsx`
기대 결과: 제목 누락으로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/app/profile/page.test.tsx`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/app/profile/page.tsx src/app/profile/page.test.tsx
git commit -m "feat: add profile page skeleton"
```

---

### 작업 11: Stripe Checkout 엔드포인트(골격)

**파일:**

- 생성: `src/app/api/tips/checkout/route.ts`
- 생성: `src/lib/stripe.ts`
- 생성: `src/lib/stripe.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/lib/stripe.test.ts`
기대 결과: `./stripe` 모듈을 찾지 못해 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/stripe.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add src/lib/stripe.ts src/lib/stripe.test.ts src/app/api/tips/checkout/route.ts
git commit -m "feat: add stripe checkout skeleton"
```

---

### 작업 12: Vercel 함수 리전 설정

**파일:**

- 생성: `vercel.json`
- 생성: `src/lib/vercel.test.ts`

**Step 1: 실패하는 테스트 작성**

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

**Step 2: 테스트 실행(실패 확인)**

실행: `pnpm test:run -- src/lib/vercel.test.ts`
기대 결과: `vercel.json` ENOENT로 FAIL.

**Step 3: 최소 구현 작성**

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

**Step 4: 테스트 실행(통과 확인)**

실행: `pnpm test:run -- src/lib/vercel.test.ts`
기대 결과: PASS

**Step 5: 커밋**

```bash
git add vercel.json src/lib/vercel.test.ts
git commit -m "chore: set vercel function region"
```

---

## 수동 설정 체크리스트

- Supabase: RLS 활성화 후 SQL 에디터에서 `supabase/schema.sql` 적용.
- 인증 제공자: Google + Apple OAuth 설정.
- 스토리지: 갤러리 사진 버킷 생성.
- Stripe: 웹훅 엔드포인트/시크릿 설정, 통화 표시 설정.
- Vercel: `.env.local.example` 기준으로 환경변수 추가.

---

## 테스트 명령 요약

- `pnpm test:run`
- `pnpm lint`
- `pnpm build`

---

## 배포 체크리스트

- 시드 콘텐츠: 데모 질문 3~5개 + 사진 10~20장.
- 랜딩 CTA → DM 페이지 연결 확인.
- 게시판 리스트/상세 로드 확인.
- Stripe Checkout 리다이렉트 확인.
- 모바일 페이지 로드 확인.
