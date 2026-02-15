# DM Single Chat (User ↔ Mod) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace thread-list DM UX with a single chat room between logged-in user and one mod account, with server-only Supabase access.

**Architecture:** `/dm` resolves one mod user (`role='mod'`) and one user-mod thread on the server, then renders one chat view. Message send/fetch uses `/api/dm/messages` only, with auth and ownership rechecked on server. Client never calls Supabase directly.

**Tech Stack:** Next.js App Router, Route Handlers, Server Components, Supabase JS (server-side), Vitest, React Testing Library

---

### Task 1: Add Single-Chat DM Server Helpers

**Files:**
- Create: `src/lib/dm-single.ts`
- Create: `src/lib/dm-single.test.ts`
- Use: `src/lib/supabase/server.ts`

**Step 1: Write the failing test**

```ts
it("returns the only mod user", async () => {
  // when one mod exists, resolve succeeds
});

it("throws when mod user count is not 1", async () => {
  // 0 or 2+ mods should throw config error
});

it("finds or creates user-mod thread", async () => {
  // existing thread reused, otherwise created
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/lib/dm-single.test.ts`
Expected: FAIL (file/module missing)

**Step 3: Write minimal implementation**

```ts
export async function getSingleModUserId(...) {}
export async function ensureSingleChatThread(userId: string, modId: string, ...) {}
export async function getSingleChatContext(userId: string, ...) {}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/lib/dm-single.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/dm-single.ts src/lib/dm-single.test.ts
git commit -m "feat: add single-chat dm server helpers"
```

### Task 2: Refactor DM Messages API to Single-Chat Contract

**Files:**
- Modify: `src/app/api/dm/messages/route.ts`
- Modify: `src/app/api/dm/messages/route.test.ts`
- Use: `src/lib/dm-single.ts`
- Use: `src/lib/dm.ts`
- Use: `src/lib/server-auth.ts`

**Step 1: Write/adjust failing test**

```ts
it("GET returns current user's single-chat messages without threadId", async () => {});
it("POST sends message to single-chat thread without threadId", async () => {});
it("returns 500 when mod config is invalid", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/api/dm/messages/route.test.ts`
Expected: FAIL (old threadId-based behavior)

**Step 3: Write minimal implementation**

```ts
// GET/POST: auth -> resolve single chat context -> list/create message
// remove threadId from API contract
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/api/dm/messages/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/dm/messages/route.ts src/app/api/dm/messages/route.test.ts
git commit -m "refactor: make dm messages api single-chat"
```

### Task 3: Simplify DM Page to Single Chat SSR

**Files:**
- Modify: `src/app/(main)/dm/page.tsx`
- Modify: `src/app/(main)/dm/page.test.tsx`
- Use: `src/lib/session-gate.ts`
- Use: `src/lib/dm-single.ts`
- Use: `src/lib/dm.ts`

**Step 1: Write/adjust failing test**

```ts
it("redirects unauthenticated user", async () => {});
it("renders single chat without thread list", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/(main)/dm/page.test.tsx`
Expected: FAIL (old thread-list expectations)

**Step 3: Write minimal implementation**

```tsx
const user = await requireSessionUser("/dm");
const { threadId } = await getSingleChatContext(user.id);
const messages = await listMessagesByThread(threadId);
return <DMClient initialMessages={messages} />;
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/(main)/dm/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/dm/page.tsx src/app/(main)/dm/page.test.tsx
git commit -m "refactor: render dm as single chat room"
```

### Task 4: Refactor DM Client to One-Room UX + Polling

**Files:**
- Modify: `src/app/(main)/dm/DMClient.tsx`
- Modify: `src/app/(main)/dm/DMClient.test.tsx`

**Step 1: Write/adjust failing test**

```ts
it("renders one conversation stream without thread selector", () => {});
it("posts message without threadId payload", async () => {});
it("polls messages endpoint periodically", async () => {});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:run src/app/(main)/dm/DMClient.test.tsx`
Expected: FAIL (thread UI still present)

**Step 3: Write minimal implementation**

```tsx
// remove thread list/create UI
// keep one message list + one composer
// POST /api/dm/messages with { body }
// polling GET /api/dm/messages (2-3s)
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:run src/app/(main)/dm/DMClient.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/dm/DMClient.tsx src/app/(main)/dm/DMClient.test.tsx
git commit -m "refactor: switch dm client to single-chat ux"
```

### Task 5: Remove Unused DM Threads API and Dead Paths

**Files:**
- Delete: `src/app/api/dm/threads/route.ts`
- Delete: `src/app/api/dm/threads/route.test.ts`
- Modify: references in DM tests/components

**Step 1: Write safety check**

Run: `rg -n "/api/dm/threads|createThreadWithFirstMessage|listThreadsByUser" src`
Expected before cleanup: references exist.

**Step 2: Remove dead paths**

Delete route + tests and update imports/usages.

**Step 3: Verify no dead references**

Run: `rg -n "/api/dm/threads|createThreadWithFirstMessage|listThreadsByUser" src`
Expected: no active runtime references.

**Step 4: Run focused DM tests**

Run: `pnpm test:run src/lib/dm-single.test.ts src/app/api/dm/messages/route.test.ts src/app/(main)/dm/page.test.tsx src/app/(main)/dm/DMClient.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add -A src/app/api/dm src/app/(main)/dm src/lib/dm-single.ts src/lib/dm-single.test.ts
git commit -m "chore: remove dm thread-list paths for single-chat"
```

### Task 6: Final Verification

**Files:**
- Verify: `src/app/(main)/dm/page.tsx`
- Verify: `src/app/(main)/dm/DMClient.tsx`
- Verify: `src/app/api/dm/messages/route.ts`
- Verify: `src/lib/dm-single.ts`

**Step 1: Run focused DM suite**

Run: `pnpm test:run src/lib/dm-single.test.ts src/app/api/dm/messages/route.test.ts src/app/(main)/dm/page.test.tsx src/app/(main)/dm/DMClient.test.tsx`
Expected: PASS

**Step 2: Run auth regression checks**

Run: `pnpm test:run src/app/auth/callback/route.test.ts src/app/auth/signout/route.test.ts`
Expected: PASS

**Step 3: Manual QA checklist**

```text
- /dm unauthenticated -> /login?redirectTo=%2Fdm
- /dm authenticated -> single conversation view only
- message send success -> appended immediately
- polling refresh reflects server-side new message
- mod config invalid(0 or many) -> clear error UI
```

**Step 4: Optional full suite**

Run: `pnpm test:run`
Expected: known unrelated failures only.

**Step 5: Commit verification-only updates**

```bash
git add <if any>
git commit -m "test: verify single-chat dm server workflow"
```
