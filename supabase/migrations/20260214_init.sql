create table if not exists users (
  id uuid primary key,
  display_name text,
  photo_url text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id),
  type text not null default 'question' check (type in ('question', 'review', 'tip')),
  title text not null,
  body text not null,
  location_tag text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references board_posts(id),
  author_id uuid references users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  assigned_responder_id uuid references users(id),
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references dm_threads(id),
  sender_id uuid references users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references users(id),
  image_url text not null,
  caption text,
  location_tag text,
  created_at timestamptz default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  context_type text not null,
  context_id uuid not null,
  amount integer not null,
  currency text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id),
  context_type text not null,
  context_id uuid not null,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists moderation_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  reason text not null,
  created_at timestamptz default now()
);

-- RLS policies (outline)
-- Enable RLS per table in Supabase and add policies for:
-- 1) Public read on board_posts, board_replies, gallery_photos
-- 2) Authenticated insert on board_posts, dm_threads, dm_messages, reports
-- 3) Only role=mod can insert gallery_photos
-- 4) Only role=verified/mod can insert board_replies
