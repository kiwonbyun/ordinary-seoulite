-- Gallery admin write constraints migration snippet
-- Safe to run multiple times.

begin;

-- Ensure gallery bucket exists.
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

-- Ensure gallery insert policy requires admin role and ownership.
drop policy if exists "admin can write gallery" on public.gallery_items;
create policy "admin can write gallery"
  on public.gallery_items for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' and created_by = auth.uid());

-- Ensure storage policies for gallery bucket.
drop policy if exists "public can read gallery image objects" on storage.objects;
create policy "public can read gallery image objects"
  on storage.objects for select
  to public
  using (bucket_id = 'gallery-images');

drop policy if exists "admin can upload gallery image objects" on storage.objects;
create policy "admin can upload gallery image objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
