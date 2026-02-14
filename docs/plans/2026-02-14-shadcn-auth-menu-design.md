# Shadcn Adoption and Header Auth Menu Design

Date: 2026-02-14

## Goals
- Add `shadcn/ui` to the frontend design stack as the new reusable UI foundation.
- Replace the custom header auth dropdown with a shadcn-based dropdown.
- Keep existing product behavior intact, especially always-visible `DM a question` in header.

## Scope
- Introduce baseline shadcn component infrastructure for gradual migration.
- Migrate header `AuthMenu` to shadcn dropdown.
- Preserve current auth flows and menu actions.

## Constraints and Decisions
- Adoption level: set up full migration foundation (not dropdown-only patch).
- Theme direction: shadcn defaults mapped immediately to current Seoul sunset tokens.
- Auth menu UX: click-first with desktop hover assist.
- Keep accessibility and mobile behavior stable while adding hover affordance.

## Recommended Approach
Adopt shadcn primitives in `src/components/ui/*` and migrate `AuthMenu` first.

Why:
- Minimizes risk by migrating one meaningful interactive component first.
- Establishes reusable patterns (`cn`, tokens, UI layer) for incremental conversion.
- Avoids all-at-once rewrite of current components.

## Tech Stack Update
Frontend design stack now includes:
- shadcn/ui
- Radix UI primitives (`@radix-ui/react-dropdown-menu`)
- utility support (`class-variance-authority`, `clsx`, `tailwind-merge`)
- optional icon system (`lucide-react`)

## Architecture
- `src/components/ui/*`
  - `dropdown-menu.tsx`
  - `button.tsx`
  - `avatar.tsx`
- `src/lib/utils.ts`
  - `cn()` helper for class composition.
- Existing domain components remain in `src/components/*`.
- `AuthMenu` consumes `ui/*` primitives.

## Theming Strategy
- Keep existing sunset CSS variables in `src/app/globals.css`.
- Map shadcn component classes to those variables for immediate visual consistency.
- Avoid introducing a separate disconnected token system.

## AuthMenu Behavior
- Trigger: avatar button.
- Open behavior:
  - Click by default on all devices.
  - Desktop hover assist (`pointer: fine`) for fast discoverability.
- Menu content:
  - user email
  - `Write a question`
  - `Sign out`

## Header Behavior
- Preserve existing links and CTA.
- `DM a question` remains visible regardless of auth state.
- Signed-in users additionally see avatar + dropdown.

## Accessibility and Mobile
- Keep keyboard menu navigation through Radix.
- Preserve touch-first interaction on mobile (click path).
- Ensure trigger/menu aria semantics come from shadcn/Radix primitives.

## Testing Strategy
Behavior-focused tests:
- `AuthMenu`
  - click open
  - desktop hover assist open
  - sign out action invocation
- `SiteHeader`
  - signed-in state: DM CTA + avatar menu coexist
  - signed-out state: existing CTA and links intact

## Done Criteria
- shadcn base UI layer exists in `src/components/ui/*`.
- Header auth menu is implemented using shadcn dropdown primitives.
- Sunset theme visual consistency is maintained.
- `DM a question` is always visible.
- Tests pass and no regressions in existing auth/header flows.
