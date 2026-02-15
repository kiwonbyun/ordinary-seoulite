# Supabase RLS Checklist

- [x] RLS enabled on all app tables (`users`, `board_posts`, `dm_threads`, `dm_messages`, `gallery_items`, `tips`)
- [x] Public read allowed only for explicitly public data (`board_posts`, `gallery_items`)
- [x] Insert policies validate `auth.uid()` ownership (`board_posts`, `dm_threads`, `dm_messages`, `tips`)
- [x] Update/Delete policies restricted to owner or admin role (board owner + gallery admin)
- [x] Service role key is never exposed to client
- [x] Sensitive workflows moved to Edge Functions when introduced (payment/webhook verification)
