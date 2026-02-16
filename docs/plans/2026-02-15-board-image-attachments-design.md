# Board Image Attachments Design

## Goal
Enable image attachments on board posts, use the first attached image as list thumbnail, and fall back to `main.jpg` when no image exists.

## Confirmed Product Decisions
- Board list is card-based with thumbnail
- Thumbnail source priority:
  1) first attached post image
  2) fallback `main.jpg`
- Board write supports image attachments
- Max images per post: 4
- File constraints: jpg/png/webp, max 5MB per file
- Storage backend: Supabase Storage

## Data and Storage Design
- Keep `board_posts` for text metadata
- Add `board_post_images` table:
  - `id uuid primary key default gen_random_uuid()`
  - `post_id uuid not null references board_posts(id) on delete cascade`
  - `image_url text not null`
  - `position integer not null`
  - `created_at timestamptz not null default now()`
- Use Storage bucket `board-post-images` (public read)
- Use `position` to preserve order and identify thumbnail (`position = 0`)

## Write/Upload Flow
1. Validate selected files on client
2. Create `board_posts` row first
3. Upload selected files to `board-post-images/{postId}/{uuid}.{ext}`
4. Insert uploaded metadata into `board_post_images` with increasing `position`
5. Redirect to board list on success

## Error Handling
- Validation failures are shown immediately on form
- Upload failure shows actionable error and prevents silent partial success
- If post is created but image metadata fails, show retry guidance

## Board List Rendering
- Query board posts with first image (or derive first image from relation)
- Render card thumbnail from first image URL
- Use local fallback asset `main.jpg` if none
- Keep write CTA visible at top-right of board page

## UI Scope
- Board page:
  - Header with always-visible write button
  - Card list with thumbnails
- Board write page:
  - Image picker (max 4)
  - Client-side file validation
  - Preview/count summary
- Board detail page:
  - Show attached images in upload order

## Security / RLS
- `board_post_images` select: public
- `board_post_images` insert/update/delete: authenticated owner of parent post only
- Gallery admin policy remains separate and unchanged

## Testing Strategy
- Focus on hooks/utils/api unit tests
- Required tests:
  - file validation helper (type/size/count)
  - upload sequence success/failure paths
  - board fetch mapping and thumbnail fallback
  - create post + images integration at data-access layer

## Non-Goals
- Drag-and-drop uploader polish
- Image transformations pipeline
- Advanced moderation tooling for board images
