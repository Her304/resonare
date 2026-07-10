-- Resonare — add captions for the ticket and each photo.
-- Run in Supabase Dashboard → SQL Editor → New query → Run. Idempotent.

alter table public.concerts
  add column if not exists ticket_caption text not null default '';

alter table public.concert_photos
  add column if not exists caption text not null default '';
