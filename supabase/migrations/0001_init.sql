-- Resonare — initial schema, RLS, and storage setup
-- Auth: Supabase Auth (magic link). Every row is scoped to auth.uid().
-- Run in Supabase Dashboard → SQL Editor → New query → Run.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.concerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  artist_name  text not null,
  venue        text not null default '',
  concert_date date,
  ticket_url   text,
  notes        text not null default '',
  favorite     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists concerts_user_id_idx on public.concerts (user_id);
create index if not exists concerts_date_idx on public.concerts (user_id, concert_date desc);

create table if not exists public.concert_photos (
  id          uuid primary key default gen_random_uuid(),
  concert_id  uuid not null references public.concerts (id) on delete cascade,
  photo_url   text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists concert_photos_concert_id_idx on public.concert_photos (concert_id, order_index);

create table if not exists public.concert_spotify (
  id           uuid primary key default gen_random_uuid(),
  concert_id   uuid not null unique references public.concerts (id) on delete cascade,
  spotify_type text not null check (spotify_type in ('album', 'playlist')),
  spotify_id   text not null,
  name         text not null,
  artist       text not null default '',
  cover_url    text,
  external_url text,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.concerts        enable row level security;
alter table public.concert_photos  enable row level security;
alter table public.concert_spotify enable row level security;

-- concerts: a user owns rows where user_id = auth.uid()
drop policy if exists "concerts_select_own" on public.concerts;
create policy "concerts_select_own" on public.concerts
  for select using (auth.uid() = user_id);

drop policy if exists "concerts_insert_own" on public.concerts;
create policy "concerts_insert_own" on public.concerts
  for insert with check (auth.uid() = user_id);

drop policy if exists "concerts_update_own" on public.concerts;
create policy "concerts_update_own" on public.concerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "concerts_delete_own" on public.concerts;
create policy "concerts_delete_own" on public.concerts
  for delete using (auth.uid() = user_id);

-- concert_photos: access allowed when the parent concert belongs to the user
drop policy if exists "concert_photos_select_own" on public.concert_photos;
create policy "concert_photos_select_own" on public.concert_photos
  for select using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_photos_insert_own" on public.concert_photos;
create policy "concert_photos_insert_own" on public.concert_photos
  for insert with check (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_photos_update_own" on public.concert_photos;
create policy "concert_photos_update_own" on public.concert_photos
  for update using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_photos_delete_own" on public.concert_photos;
create policy "concert_photos_delete_own" on public.concert_photos
  for delete using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

-- concert_spotify: same parent-ownership check
drop policy if exists "concert_spotify_select_own" on public.concert_spotify;
create policy "concert_spotify_select_own" on public.concert_spotify
  for select using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_spotify_insert_own" on public.concert_spotify;
create policy "concert_spotify_insert_own" on public.concert_spotify
  for insert with check (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_spotify_update_own" on public.concert_spotify;
create policy "concert_spotify_update_own" on public.concert_spotify
  for update using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

drop policy if exists "concert_spotify_delete_own" on public.concert_spotify;
create policy "concert_spotify_delete_own" on public.concert_spotify
  for delete using (
    exists (select 1 from public.concerts c where c.id = concert_id and c.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets (private) + policies
-- Files are stored under a per-user prefix:  {auth.uid()}/{concert_id}/{filename}
-- so the first path segment must equal the user's id.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('tickets', 'tickets', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- tickets bucket: owner-only CRUD, keyed on the first folder = user id
drop policy if exists "tickets_select_own" on storage.objects;
create policy "tickets_select_own" on storage.objects
  for select using (
    bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tickets_insert_own" on storage.objects;
create policy "tickets_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tickets_update_own" on storage.objects;
create policy "tickets_update_own" on storage.objects
  for update using (
    bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tickets_delete_own" on storage.objects;
create policy "tickets_delete_own" on storage.objects
  for delete using (
    bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- photos bucket: owner-only CRUD
drop policy if exists "photos_select_own" on storage.objects;
create policy "photos_select_own" on storage.objects
  for select using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_update_own" on storage.objects;
create policy "photos_update_own" on storage.objects
  for update using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
