-- Resonare — add a tour / event name distinct from the performing artist.
-- Run in Supabase Dashboard → SQL Editor → New query → Run. Idempotent.

alter table public.concerts
  add column if not exists show_name text not null default '';
