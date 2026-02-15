# DM Server-First Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete DM threads/messages with server-only Supabase access and auth-required usage.

**Architecture:** SSR loads initial DM data on `/dm` after session validation. All mutations and subsequent reads run through server route handlers (`/api/dm/*`) that re-check ownership and validate payloads. Client UI only talks to app APIs, never Supabase directly.

**Tech Stack:** Next.js App Router, Route Handlers, Server Components, Supabase JS (server-side), Vitest, React Testing Library

---

### Task 1: Add Server DM Data Layer

**Files:**
- Create: `src/lib/dm.ts`
- Create: `src/lib/dm.test.ts`
- Use: `src/lib/supabase/server.ts`
- Use: `src/lib/validation/dm.ts`

**Step 1: Write the failing test**

```ts
it("maps dm thread rows to view model", async () => {
  // mock supabase return row with snake_case
  // expect camelCase thread view output
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/lib/dm.test.ts`
Expected: FAIL (module missing)

**Step 3: Write minimal implementation**

```ts
export async function listThreadsByUser(userId: string) { ... }
export async function listMessagesByThread(threadId: string) { ... }
export async function createThreadWithFirstMessage(...) { ... }
export async function createMessage(...) { ... }
export async function assertThreadOwner(threadId: string, userId: string) { ... }
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/lib/dm.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/dm.ts src/lib/dm.test.ts
git commit -m "feat: add server dm data layer"
```

### Task 2: Implement DM Threads API

**Files:**
- Create: `src/app/api/dm/threads/route.ts`
- Create: `src/app/api/dm/threads/route.test.ts`
- Use: `src/lib/dm.ts`
- Use: `src/lib/server-auth.ts`
- Use: `src/lib/validation/dm.ts`

**Step 1: Write the failing test**

```ts
it("returns 401 for unauthenticated thread list", async () => {});
it("returns user thread list when authenticated", async () => {});
it("creates thread and first message", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/api/dm/threads/route.test.ts`
Expected: FAIL (route missing)

**Step 3: Write minimal implementation**

```ts
export async function GET() { /* auth + listThreadsByUser */ }
export async function POST(req: Request) { /* auth + validate + createThreadWithFirstMessage */ }
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/api/dm/threads/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/dm/threads/route.ts src/app/api/dm/threads/route.test.ts
git commit -m "feat: add dm threads api"
```

### Task 3: Implement DM Messages API

**Files:**
- Create: `src/app/api/dm/messages/route.ts`
- Create: `src/app/api/dm/messages/route.test.ts`
- Use: `src/lib/dm.ts`
- Use: `src/lib/server-auth.ts`
- Use: `src/lib/validation/dm.ts`

**Step 1: Write the failing test**

```ts
it("returns 401 for unauthenticated message access", async () => {});
it("returns 403 for non-owner thread", async () => {});
it("creates message for owner", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/api/dm/messages/route.test.ts`
Expected: FAIL (route missing)

**Step 3: Write minimal implementation**

```ts
export async function GET(req: Request) { /* auth + owner check + list messages */ }
export async function POST(req: Request) { /* auth + validate + owner check + insert */ }
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/api/dm/messages/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/dm/messages/route.ts src/app/api/dm/messages/route.test.ts
git commit -m "feat: add dm messages api"
```

### Task 4: Add Server-Rendered DM Page Shell with Auth Gate

**Files:**
- Modify: `src/app/(main)/dm/page.tsx`
- Modify: `src/app/(main)/dm/page.test.tsx`
- Use: `src/lib/server-auth.ts`
- Use: `src/lib/auth-redirect.ts`
- Use: `src/lib/dm.ts`

**Step 1: Write the failing test**

```ts
it("redirects to login when unauthenticated", async () => {});
it("renders thread section when authenticated", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/(main)/dm/page.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```tsx
const user = await getSessionUserFromCookies();
if (!user) redirect(buildLoginRedirectPath("/dm"));
const threads = await listThreadsByUser(user.id);
const initialThreadId = ...;
const messages = ...;
return <DMClient ... />;
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/(main)/dm/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/dm/page.tsx src/app/(main)/dm/page.test.tsx
git commit -m "feat: gate dm page behind auth and server-render initial data"
```

### Task 5: Add DM Client Interaction Layer

**Files:**
- Create: `src/app/(main)/dm/DMClient.tsx`
- Create: `src/app/(main)/dm/DMClient.test.tsx`
- Use: `/api/dm/threads`, `/api/dm/messages`

**Step 1: Write the failing test**

```ts
it("creates a new thread with first message", async () => {});
it("sends a message in selected thread", async () => {});
it("shows inline error from api", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/(main)/dm/DMClient.test.tsx`
Expected: FAIL (component missing)

**Step 3: Write minimal implementation**

```tsx
// thread list panel + message panel
// form to create first thread when empty
// form to send message in selected thread
// fetch own app api routes, update local state
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/(main)/dm/DMClient.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/dm/DMClient.tsx src/app/(main)/dm/DMClient.test.tsx
git commit -m "feat: add dm client interactions via server apis"
```

### Task 6: Final Verification

**Files:**
- Verify: `src/app/(main)/dm/page.tsx`
- Verify: `src/app/(main)/dm/DMClient.tsx`
- Verify: `src/app/api/dm/threads/route.ts`
- Verify: `src/app/api/dm/messages/route.ts`
- Verify: `src/lib/dm.ts`

**Step 1: Run focused DM tests**

Run:
`pnpm test:run src/lib/dm.test.ts src/app/api/dm/threads/route.test.ts src/app/api/dm/messages/route.test.ts src/app/(main)/dm/page.test.tsx src/app/(main)/dm/DMClient.test.tsx`

Expected: PASS

**Step 2: Run smoke tests for auth-sensitive areas**

Run:
`pnpm test:run src/app/auth/callback/route.test.ts src/app/auth/signout/route.test.ts`

Expected: PASS

**Step 3: Manual QA checklist**

```text
- 로그아웃 상태에서 /dm 진입 시 /login?redirectTo=%2Fdm 리다이렉트
- 로그인 상태에서 내 스레드 목록이 보임
- 스레드 생성 시 목록에 즉시 추가
- 메시지 전송 시 목록 하단에 즉시 반영
- 타 사용자 스레드 ID로 API 호출 시 403
```

**Step 4: Optional full test run**

Run: `pnpm test:run`
Expected: only known unrelated failures if any.

**Step 5: Commit verification-only adjustments**

```bash
git add <if any>
git commit -m "test: verify dm server-auth workflow"
```
