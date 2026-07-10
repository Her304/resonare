# Resonare

A personal concert-memory web app. Photograph your ticket, link a Spotify album or playlist,
add captioned photos, and write (or AI-draft) a note — all tied to one concert entry.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** — Postgres + Auth (magic link) + Storage, all behind Row Level Security
- **Spotify Web API** via a server-side proxy (Client Credentials)
- **OpenAI** for optional AI-generated concert notes
- **Tailwind CSS**, deployed on **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

### Environment variables

See `.env.example`. You'll need a Supabase project, a Spotify developer app, and (optional)
an OpenAI API key. Never commit `.env.local`.

### Database

Run the SQL in `supabase/migrations/` (in order) via the Supabase SQL Editor to create the
schema, RLS policies, and storage buckets.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

See `DESIGN.md` for the visual design reference.
