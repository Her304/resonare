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

profiles         -- one row per auth user, created by an on_auth_user_created trigger
  id (= auth.users.id), username (citext unique), display_name, bio, avatar_url,
  is_private, terms_accepted_at, terms_version, created_at, updated_at
  -- username uniqueness is why this table exists; auth metadata cannot enforce it

reserved_usernames -- route names + impersonation risks, checked by username_available()
```

All concert tables use **Row Level Security** — users only access their own rows.

`profiles` is the deliberate exception: it is **readable by any authenticated user**, because
usernames are the basis of the planned social features. Insert/update remain owner-only.
`public.username_available(text)` is a `security definer` function granted to `anon`, so the sign-up
form can check a handle before the user has a session without exposing the table itself. Uniqueness
is ultimately enforced by the constraint, not the check — `/login` maps the resulting insert error
back to "that username was just taken".

Migrations live in `supabase/migrations/` and are applied by hand in the Supabase SQL editor
(`0001_init` → `0002_captions` → `0003_show_name` → `0004_profiles`). They are idempotent
(`if not exists` / `add column if not exists`).

### Supabase Storage Buckets

- `tickets/` — one ticket image per concert
- `photos/` — up to 10 concert photos per concert

### Spotify Integration

Server-side routes `/api/spotify/search` and `/api/spotify/lookup` proxy requests to Spotify using Client Credentials (no user OAuth). Users search (or paste an album/playlist link), pick a result, and it's saved to `concert_spotify`.

### AI Note Integration

Server-side route `/api/generate-note` calls OpenAI (`gpt-4o-mini`) with the show details + photo/ticket captions and a chosen tone to draft a short first-person diary reflection. The API key stays server-side; returns `500 "OpenAI key not configured"` when `OPENAI_API_KEY` is unset.

### Auth

Email + password via Supabase Auth — it handles bcrypt hashing (`auth.users.encrypted_password`)
and JWT issuance; `@supabase/ssr` keeps the session in cookies and `lib/supabase/middleware.ts`
refreshes it on every request. Nothing is hand-rolled and no password ever reaches our code.

Email is only sent for password recovery. This depends on **Confirm email being off** in the
Supabase dashboard (Authentication → Providers → Email) — with it on, `signUp` returns no session,
and `/login` falls back to a "confirm your email" state. Recovery links point at
`/auth/callback?next=/reset-password`, which exchanges the code for a session before the user picks
a new password. Supabase's built-in SMTP is rate-limited to a handful of emails per hour (HTTP 429);
custom SMTP is needed for real volume.

Sign-up captures email, a unique username, password + confirmation, and a required consent checkbox
covering the terms, community guidelines and data collection. The accepted `POLICY_VERSION` and a
timestamp are passed through `options.data` and recorded on the profile row, so a future policy
change can identify who has not re-accepted.

Shared auth-screen styles live in `components/authStyles.ts`; legal copy constants (entity name,
contact addresses, policy version) live in `lib/legal.ts` — these contain **placeholders that must
be filled in before launch**.

### Key Pages

Real App Router routes. `/` is the public marketing landing page; unauthenticated users hitting any other non-public route are redirected to `/login` by middleware (public routes: `/`, `/login`, `/forgot-password`, `/reset-password`, `/auth/*`). The authenticated app lives under the `app/(app)/` route group (shared phone-frame layout + `AppStore`).

| Route | Purpose |
|---|---|
| `/` | Public landing page (`app/page.tsx`) — hero, feature grid, CTAs to `/login`. Client component with motion: kinetic-type hero entrance, IntersectionObserver scroll reveals, a stat count-up + ring draw on an on-brand phone mockup, and a "Magic Move" shared concert card that relays from the hero into the features section. All motion is gated behind `prefers-reduced-motion`. |
| `/home` | Concert list (grid of cards) |
| `/log` | Multi-step form: the show → the memories → the soundtrack → the feeling |
| `/profile` | Stats, clickable stat tiles (bottom-sheet breakdowns), city map, personal goal, data export/import |
| `/concerts/[id]` | Detail view: ticket, gallery, Spotify card, notes (shareable URL) |
| `/login` | Email + password sign in / sign up (tabbed); sign-up also seeds `display_name` |
| `/forgot-password` | Requests a password-reset email (`resetPasswordForEmail`) |
| `/reset-password` | Sets a new password from a recovery link (`updateUser`); shows an expired-link state when no session |
| `/auth/callback`, `/auth/signout` | Emailed-code exchange (recovery / confirmation) + sign-out route handlers |
| `/terms`, `/privacy`, `/community-guidelines` | Policy documents (`app/(legal)/` route group — plain document styling via `legal.css`, deliberately unlike the app chrome) |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=          # server-only, never exposed to client
OPENAI_API_KEY=                 # server-only, powers /api/generate-note
```
