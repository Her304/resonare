# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resonare** is a personal concert memory web app. Users photograph their ticket, link a Spotify album or playlist, upload up to 10 concert photos, and write notes — all tied to a single concert entry.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database + Auth + Storage**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Music**: Spotify Web API via a server-side proxy route (Client Credentials Flow)
- **Hosting**: Vercel (Hobby tier)

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
```

## Architecture

### Data Flow

```
Browser (Next.js Client)
        │
        ├── Vercel Edge (Next.js App Router)
        │         ├── /api/spotify/*   → Spotify Web API (server-side, hides secret)
        │         └── /api/concerts/*  → Supabase (server actions / route handlers)
        │
        └── Supabase (direct client calls for file uploads)
                  ├── Auth
                  ├── PostgreSQL DB (with RLS)
                  └── Storage Buckets: tickets/, photos/
```

### Database Schema

```sql
concerts         -- one row per concert event
  id, user_id, artist_name, venue, concert_date, ticket_url, notes, created_at

concert_photos   -- up to 10 photos per concert
  id, concert_id, photo_url, order_index, created_at

concert_spotify  -- one linked album or playlist per concert
  id, concert_id, spotify_type ('album'|'playlist'), spotify_id,
  name, artist, cover_url, external_url
```

All tables use **Row Level Security** — users only access their own rows.

### Supabase Storage Buckets

- `tickets/` — one ticket image per concert
- `photos/` — up to 10 concert photos per concert

### Spotify Integration

Server-side route at `/api/spotify/search` proxies requests to Spotify using Client Credentials (no user OAuth). Users search, pick an album or playlist, and the result is saved to `concert_spotify`.

### Key Pages

| Route | Purpose |
|---|---|
| `/` | Concert list (grid of cards) |
| `/concerts/new` | Multi-step form: ticket → details → Spotify → photos → notes |
| `/concerts/[id]` | Detail view: ticket, gallery, Spotify card, notes |
| `/auth` | Sign in / sign up |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=          # server-only, never exposed to client
```
