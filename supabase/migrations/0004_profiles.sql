-- Resonare — public profiles: unique usernames + recorded policy consent.
-- Run in Supabase Dashboard → SQL Editor → New query → Run. Idempotent.
--
-- Why a table: a username must be globally unique, and auth.users.raw_user_meta_data
-- cannot carry a unique constraint. This table is also the foundation the social
-- features build on (follows, public collections), so it is readable by any signed-in
-- user rather than owner-only like the concert tables.

create extension if not exists citext;

create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          citext not null unique,
  display_name      text not null default '',
  bio               text not null default '',
  avatar_url        text,
  -- Social groundwork: when true, the profile is excluded from discovery and
  -- follow requests must be approved. Nothing reads this yet.
  is_private        boolean not null default false,
  -- Record of the consent captured at sign-up. Kept per-version so a future
  -- policy change can detect who has not yet accepted the current one.
  terms_accepted_at timestamptz,
  terms_version     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- 3–20 chars, letters/digits/underscore, must start with a letter or digit.
  constraint profiles_username_format check (username ~ '^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$')
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ─────────────────────────────────────────────────────────────────────────────
-- Reserved usernames — route names and impersonation risks.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.reserved_usernames (
  username citext primary key
);

insert into public.reserved_usernames (username) values
  ('admin'), ('administrator'), ('resonare'), ('support'), ('help'), ('api'),
  ('auth'), ('login'), ('logout'), ('signup'), ('signin'), ('settings'),
  ('profile'), ('profiles'), ('home'), ('log'), ('concerts'), ('terms'),
  ('privacy'), ('security'), ('about'), ('contact'), ('legal'), ('root'),
  ('system'), ('staff'), ('team'), ('official'), ('moderator'), ('mod'),
  ('null'), ('undefined'), ('me'), ('you'), ('new'), ('edit'), ('delete')
on conflict (username) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profile whenever an auth user is created.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested citext;
begin
  requested := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  -- Fall back to a derived username so users created outside the sign-up form
  -- (dashboard invites, seeds) still get a profile row.
  if requested is null then
    requested := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  insert into public.profiles (id, username, display_name, terms_accepted_at, terms_version)
  values (
    new.id,
    requested,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), requested),
    case
      when (new.raw_user_meta_data ->> 'terms_accepted_at') is not null
      then (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
      else now()
    end,
    coalesce(nullif(new.raw_user_meta_data ->> 'terms_version', ''), 'unknown')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Username availability, callable before the user has a session.
-- security definer so anon can check without being able to read the table.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.username_available(candidate text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if candidate is null or candidate !~ '^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$' then
    return false;
  end if;

  if exists (select 1 from public.reserved_usernames r where r.username = candidate::citext) then
    return false;
  end if;

  return not exists (select 1 from public.profiles p where p.username = candidate::citext);
end;
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.reserved_usernames enable row level security;

-- Readable by any signed-in user: usernames and display names are public
-- surface area, and the social features need to resolve them.
drop policy if exists "profiles are readable by authenticated users" on public.profiles;
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- reserved_usernames is enforced through username_available(); no direct reads.

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: give existing accounts a profile so nothing is left without one.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.profiles (id, username, display_name, terms_version)
select
  u.id,
  'user_' || substr(replace(u.id::text, '-', ''), 1, 12),
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), ''),
  'pre-consent'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;
