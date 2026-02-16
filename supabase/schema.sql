create table if not exists users (
  id uuid primary key,
  email text,
  display_name text,
  photo_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users(id),
  type text not null check (type in ('question', 'review', 'tip')),
  title text not null,
  body text not null,
  location_tag text,
  status text not null default 'open' check (status in ('open', 'answered')),
  created_at timestamptz not null default now()
);

create table if not exists board_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references board_posts(id) on delete cascade,
  image_url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references dm_threads(id) on delete cascade,
  sender_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  location_tag text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  target_type text not null check (target_type in ('dm', 'board')),
  target_id uuid not null,
  amount integer not null check (amount > 0),
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('board-post-images', 'board-post-images', true)
on conflict (id) do nothing;
