# Korea Travel Q&A MVP Design

Date: 2026-02-13

## Goals
- Help first-time, short-term Korea travelers who are interested in Korean culture ask questions in English and get answers within 24 hours.
- Drive early traffic from Substack to the site and maximize question/DM starts.
- Keep costs minimal while proving demand and trust.

## Audience and Positioning
- Audience: First-time, short-term travelers with some Korean culture interest.
- Positioning: "A regular person living in Seoul"; not overly commercial.
- Operator identity: Real photo shown; real name not shown.

## MVP Features
- Public Board: read without login; post questions with login; operator and verified responders can answer.
- Threaded DM: login required; user <-> operator or verified responders; 24h response target.
- Tips: optional, post-answer thanks via Stripe Checkout; free to use otherwise.
- Gallery: operator-only uploads; public viewing; captions and location tags.
- Moderation: basic banned-words filter + report button.

## Information Architecture
- Landing: short value statement + CTA "DM a question" + previews (recent Q&A, gallery).
- Board: list, filters (Seoul/Busan/Jeju/etc), detail with replies.
- DM Inbox: threads and message view.
- Gallery: photos with tags.
- Profile: operator intro + photo.
- Auth: Google/Apple.

## Data Model (Core Tables)
- User(id, provider, email, displayName, photoUrl, role, createdAt)
- BoardPost(id, authorId, title, body, locationTag, status, createdAt)
- BoardReply(id, postId, authorId, body, createdAt)
- DmThread(id, userId, assignedResponderId, status, createdAt)
- DmMessage(id, threadId, senderId, body, createdAt)
- GalleryPhoto(id, uploaderId, imageUrl, caption, locationTag, createdAt)
- Tip(id, userId, contextType, contextId, amount, currency, status, createdAt)
- Report(id, reporterId, contextType, contextId, reason, createdAt)
- ModerationBlock(id, userId, reason, createdAt)
- NotificationPref(userId, emailOptIn)

## Key Flows
- Ask a question (board): login -> create post -> visible publicly -> operator/verified reply.
- Start DM: login -> create thread -> reply within 24h target -> optional tip.
- Tip: Stripe Checkout -> thank you state.
- Report: create report -> operator review.

## Tech Stack
- Next.js App Router
- Supabase Auth (Google/Apple)
- Supabase Postgres + Storage
- Stripe Checkout
- Vercel deploy

## Deployment and Regions
- Vercel Functions region: iad1.
- Supabase region: choose closest available to iad1.

## Metrics (MVP)
- DM starts, board question starts, reply completion rate, 24h response rate, tip conversion.

## Risks and Mitigations
- Low initial trust: seed Q&A and gallery, clear operator profile.
- Latency: align DB region with Functions region.
- Abuse: banned words + report + manual review.

## Open Questions
- None for MVP.
