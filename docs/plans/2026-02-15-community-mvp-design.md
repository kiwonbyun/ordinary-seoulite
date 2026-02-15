# Community MVP Design

## Goal
Launch a community-first web app for English-speaking users who need practical Korea guidance.

## Product Scope (MVP)
- Home
- Board
- DM
- Gallery
- Tip (donation-focused)

## Navigation IA
- Home
- Board
- DM
- Gallery

## Core Decisions
- Content model: single board feed with tags (`question`, `review`, `tip`)
- DM model: one 1:1 single thread per user
- Gallery uploads: admin-only
- Monetization: tips/donations

## Access Policy
- Public (no login): Home, Board read, Board detail read, Gallery read
- Login required: Board write, DM send, Tip
- Admin only: Gallery upload/edit/delete

## User Flows
1. User lands on Home and reads service trust signals.
2. User browses Board posts and tag filters.
3. If unresolved, user sends a private DM.
4. If satisfied, user sends a Tip.
5. Gallery supports trust and context with curated local images.

## Data Model
- `users`
  - `id`, `email`, `display_name`, `avatar_url`, `role(user|admin)`, `created_at`
- `board_posts`
  - `id`, `author_id`, `type(question|review|tip)`, `title`, `body`, `location_tag`, `status(open|answered)`, `created_at`
- `dm_threads`
  - `id`, `user_id`, `status(open|closed)`, `created_at`
- `dm_messages`
  - `id`, `thread_id`, `sender_id`, `body`, `created_at`
- `gallery_items`
  - `id`, `image_url`, `caption`, `location_tag`, `created_by`, `created_at`
- `tips`
  - `id`, `user_id`, `target_type(dm|board)`, `target_id`, `amount`, `currency`, `status(pending|paid|failed)`, `created_at`

## Security and RLS Baseline
- `board_posts`: public read, authenticated create, owner update/delete
- `dm_threads` / `dm_messages`: owner + admin only
- `gallery_items`: public read, admin write
- `tips`: authenticated create, owner/admin read

## Screen Scope (MVP)
- Home: intro + CTA + recent content preview
- Board list: search + tag filter + latest feed
- Board write (auth): title/body/tag/location
- Board detail: post body + status + DM CTA + Tip CTA
- DM (auth): single thread timeline + composer
- Gallery: read-only public card grid
- Auth: login/logout + protected route redirect
- Tip: start/success/failure states

## Non-Goals
- Multi-thread DM per user
- Public gallery upload
- Subscription monetization
- Complex moderation panel
