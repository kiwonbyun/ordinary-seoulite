alter table users enable row level security;
alter table board_posts enable row level security;
alter table board_post_images enable row level security;
alter table dm_threads enable row level security;
alter table dm_messages enable row level security;
alter table gallery_items enable row level security;
alter table tips enable row level security;

create policy "users can read own profile"
  on users for select
  to authenticated
  using (auth.uid() = id);

create policy "public can read user identity"
  on users for select
  to anon, authenticated
  using (true);

create policy "users can upsert own profile"
  on users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users can update own profile"
  on users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "public can read board posts"
  on board_posts for select
  to anon, authenticated
  using (true);

create policy "authenticated can create own board posts"
  on board_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "author can update own board posts"
  on board_posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "author can delete own board posts"
  on board_posts for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "public can read board post images"
  on board_post_images for select
  to anon, authenticated
  using (true);

create policy "author can insert board post images"
  on board_post_images for insert
  to authenticated
  with check (
    exists (
      select 1 from board_posts p
      where p.id = board_post_images.post_id and p.author_id = auth.uid()
    )
  );

create policy "author can update board post images"
  on board_post_images for update
  to authenticated
  using (
    exists (
      select 1 from board_posts p
      where p.id = board_post_images.post_id and p.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from board_posts p
      where p.id = board_post_images.post_id and p.author_id = auth.uid()
    )
  );

create policy "author can delete board post images"
  on board_post_images for delete
  to authenticated
  using (
    exists (
      select 1 from board_posts p
      where p.id = board_post_images.post_id and p.author_id = auth.uid()
    )
  );

create policy "owner can read own dm threads"
  on dm_threads for select
  to authenticated
  using (auth.uid() = user_id);

create policy "owner can create own dm thread"
  on dm_threads for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "owner can read own dm messages"
  on dm_messages for select
  to authenticated
  using (
    exists (
      select 1 from dm_threads t
      where t.id = dm_messages.thread_id and t.user_id = auth.uid()
    )
  );

create policy "owner can send own dm messages"
  on dm_messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from dm_threads t
      where t.id = dm_messages.thread_id and t.user_id = auth.uid()
    )
  );

create policy "public can read gallery"
  on gallery_items for select
  to anon, authenticated
  using (true);

create policy "admin can write gallery"
  on gallery_items for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' and created_by = auth.uid());

create policy "owner can create tips"
  on tips for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "owner can read own tips"
  on tips for select
  to authenticated
  using (auth.uid() = user_id);

create policy "public can read board post image objects"
  on storage.objects for select
  to public
  using (bucket_id = 'board-post-images');

create policy "authenticated can upload board post image objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'board-post-images');

create policy "public can read gallery image objects"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery-images');

create policy "admin can upload gallery image objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
