# Vite React Supabase Rebuild Design

## Goal
Rebuild Ordinary Seoulite from scratch with minimum operating cost and fast, responsive client interactions.

## Priorities
- Lowest possible operating cost for early stage
- Fast UI response with immediate interaction feedback
- Keep backend surface area minimal

## Confirmed Stack
- Frontend: Vite + React + TypeScript (SPA)
- Hosting: Cloudflare Pages
- Backend platform: Supabase (Auth + Postgres + RLS + optional Edge Functions)
- UI: shadcn/ui
- Networking: axios
- Server state: TanStack Query
- Routing: TanStack Router

## Architecture
- Default data path is direct client calls to Supabase via `supabase-js`.
- Authorization is enforced in Postgres with RLS policies, not in frontend checks.
- Create server-side logic only when necessary:
  - secret handling
  - payment verification/webhooks
  - privileged moderation/admin operations
- Use Supabase Edge Functions for these cases before introducing a standalone backend.

## Data and Security Model
- Client ships only Supabase anon key.
- Never expose Supabase service role key in client.
- Enable RLS on all application tables.
- Define strict table policies for select/insert/update/delete based on `auth.uid()` and role claims.
- Sensitive workflows run in Edge Functions.

## UX and State Strategy
- TanStack Query handles remote/cache state.
- React local state handles transient UI state.
- Mutations use optimistic updates by default.
- On mutation failure: rollback cache + show clear user error feedback.

## Folder Boundary Direction
- `components/ui`: presentational primitives only
- `features/*`: domain logic, data-access functions, hooks, schemas
- `routes`: page composition and route-level loading orchestration
- Shared infra under `lib/` for Supabase and Query client setup

## Testing Scope
- Include unit tests for hooks, utility functions, validation schemas, and data access modules.
- Exclude UI component rendering tests (`components/ui`).
- Prioritize tests for:
  - optimistic update rollback paths
  - auth/permission branches
  - error handling behavior

## Deployment and Operations
- Deploy SPA assets on Cloudflare Pages.
- Keep env minimal in frontend: Supabase URL + anon key.
- Keep secrets only in Supabase Edge Function environment.
- Start with low-cost tiers and tune query/index/caching as usage grows.

## Non-Goals (Initial Build)
- Dedicated always-on backend server
- Broad UI snapshot/component test suite
- Premature scaling infrastructure for high traffic

## Decision Summary
For MAU under ~1,000 and cost-first operation, `Cloudflare Pages + Vite/React SPA + Supabase direct access + strict RLS + selective Edge Functions` provides the best balance of speed, cost, and maintainability.
