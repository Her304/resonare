# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Resonare** is a personal concert memory web app. Users photograph their ticket, name the artist and (optionally) the tour/event, link a Spotify album or playlist, upload up to 10 concert photos, and write notes — all tied to a single concert entry. A profile page rolls the collection up into stats, an interactive map of the cities they've seen shows in, and a personal shows goal.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: pixel-exact inline styles for components; Tailwind utilities for page/layout wrappers; a small `globals.css` for resets, grain, and press/focus states
- **Database + Auth + Storage**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Music**: Spotify Web API via a server-side proxy route (Client Credentials Flow)
- **Maps**: Leaflet + react-leaflet with CartoDB dark OSM tiles; venue→coordinate geocoding via Nominatim (no API key, cached in `localStorage`)
- **AI notes**: OpenAI (`gpt-4o-mini`) via a server route drafts a diary reflection from show details + photo captions
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
        │         ├── /api/spotify/*     → Spotify Web API (server-side, hides secret)
        │         └── /api/generate-note → OpenAI (server-side, hides key)
        │
        ├── Supabase (direct client calls)
        │         ├── Auth
        │         ├── PostgreSQL DB (with RLS)
        │         └── Storage Buckets: tickets/, photos/
        │
        └── Nominatim (client-side geocoding for the profile map; results cached in localStorage)
```

### Client architecture & state

The UI is a set of presentational components in `components/Resonare.tsx` (`HomeScreen`, `LogScreen`,
`DetailScreen`, `ProfileScreen`, `BottomNav`, `Lightbox`, plus shared icons/helpers), driven by real
URL routes rather than a single in-memory screen switch.

- **`components/AppStore.tsx`** — a client context provider that owns the shared `concerts` + `profile`
  state and all mutations (`toggleFavorite`, `addConcert`, `importConcerts`, `resetConcerts`,
  `renameUser`, `updateGoal`, `doSignOut`). It lives in the `app/(app)/layout.tsx` shell so state
  survives navigation between tabs (no refetch on every route change). Pages read it via `useStore()`.
- **`app/(app)/layout.tsx`** — the phone-frame shell: renders the gradient background, provider,
  global loading/error states, and the conditional `BottomNav`. The frame carries
  `transform: translateZ(0)` so `position: fixed` overlays (lightboxes, the profile stat sheet) pin to
  the phone frame and clip to its rounded corners.
- **`lib/concerts.ts`** — all Supabase reads/writes, Spotify search/lookup, and `generateNote`.

### Derived data (not stored)

- **City** is parsed from the trailing segment of the free-text `venue` ("Venue, City") via `cityFromVenue`.
- **Map pin coordinates** are geocoded from the city string on the client and cached in `localStorage`
  (`resonare:geo:v1:<city>`), including negative results; nothing is written back to the DB.
- **display name** and the **personal shows goal** live in Supabase Auth user metadata
  (`display_name`, `shows_goal`), not in a table.

### Database Schema

```sql
concerts         -- one row per concert event
  id, user_id, artist_name, show_name, venue, concert_date,
  ticket_url, ticket_caption, notes, favorite, created_at
  -- show_name = optional tour/event name, distinct from artist_name

concert_photos   -- up to 10 photos per concert
  id, concert_id, photo_url, order_index, caption, created_at

concert_spotify  -- one linked album or playlist per concert
  id, concert_id, spotify_type ('album'|'playlist'), spotify_id,
  name, artist, cover_url, external_url
```

All tables use **Row Level Security** — users only access their own rows.

Migrations live in `supabase/migrations/` and are applied by hand in the Supabase SQL editor
(`0001_init` → `0002_captions` → `0003_show_name`). They are idempotent (`if not exists` /
`add column if not exists`).

### Supabase Storage Buckets

- `tickets/` — one ticket image per concert
- `photos/` — up to 10 concert photos per concert

### Spotify Integration

Server-side routes `/api/spotify/search` and `/api/spotify/lookup` proxy requests to Spotify using Client Credentials (no user OAuth). Users search (or paste an album/playlist link), pick a result, and it's saved to `concert_spotify`.

### AI Note Integration

Server-side route `/api/generate-note` calls OpenAI (`gpt-4o-mini`) with the show details + photo/ticket captions and a chosen tone to draft a short first-person diary reflection. The API key stays server-side; returns `500 "OpenAI key not configured"` when `OPENAI_API_KEY` is unset.

### Key Pages

Real App Router routes. Unauthenticated users are redirected to `/login` by middleware; `/` redirects to `/home`. The authenticated app lives under the `app/(app)/` route group (shared phone-frame layout + `AppStore`).

| Route | Purpose |
|---|---|
| `/` | Redirects to `/home` |
| `/home` | Concert list (grid of cards) |
| `/log` | Multi-step form: the show → the memories → the soundtrack → the feeling |
| `/profile` | Stats, clickable stat tiles (bottom-sheet breakdowns), city map, personal goal, data export/import |
| `/concerts/[id]` | Detail view: ticket, gallery, Spotify card, notes (shareable URL) |
| `/login` | Magic-link sign in |
| `/auth/callback`, `/auth/signout` | Supabase magic-link exchange + sign-out route handlers |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=          # server-only, never exposed to client
OPENAI_API_KEY=                 # server-only, powers /api/generate-note
```
