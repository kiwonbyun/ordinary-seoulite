# Board New Editor and Post Creation Design

Date: 2026-02-14

## Goals
- Implement a real post creation flow on `/board/new`.
- Keep editor MVP simple with `textarea` input.
- Support community board use cases: questions, reviews, and tips.

## Scope
- Build create-post form on `/board/new`.
- Enforce required post type with default `question`.
- Validate and persist posts to Supabase.
- Show success toast and redirect to board list.

## Constraints and Decisions
- Editor type: `textarea` (MVP).
- Post type is required: `question | review | tip`.
- Default type: `question`.
- Submission architecture: Next.js Server Action.
- Success UX: toast + redirect to `/board`.

## Recommended Approach
Use a Server Action form submission pipeline.

Why:
- Keeps validation and DB write on server.
- Works naturally with App Router and redirect flow.
- Minimizes client-side auth/data exposure.

## Data and Validation
- Extend post schema with required `type` enum.
- Keep existing `title`, `body`, optional `locationTag`.
- Validate all fields server-side before DB insert.

## Database
- Add `type` column to `board_posts` in `supabase/schema.sql`.
- Suggested default: `question`.
- Optional: DB check constraint for allowed values.

## UI Flow (`/board/new`)
- Fields:
  - title
  - type (required select, default `question`)
  - locationTag (optional)
  - body (`textarea`)
- Actions:
  - publish post
  - cancel/back to board

## Submission Flow
1. User submits form.
2. Server Action validates payload.
3. Insert into `board_posts`.
4. Redirect to `/board?created=1`.
5. Board page reads query and shows success toast.

## Error Handling
- Validation errors shown near form.
- DB write failures show generic retry message.
- Keep user input on validation failure.

## Testing Strategy
- Validation tests for new `type` requirements.
- Form/default behavior tests for `question` default.
- Server Action unit test for payload/validation branches.
- Board page toast test for `created=1` query flag.

## Done Criteria
- Authenticated user can create post from `/board/new`.
- `type` required and defaults to `question`.
- Successful submit redirects and shows success toast on board page.
- Validation and DB failure paths are handled.
