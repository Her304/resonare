import { createClient } from "@/lib/supabase/client";

// ─── Shared types (used by the UI) ────────────────────────────────────────────

export interface SpotifyItem {
  id: string;
  name: string;
  artist: string;
  type: string; // 'album' | 'playlist'
  coverUrl: string | null;
  externalUrl: string | null;
}

export interface Photo {
  url: string; // signed URL for display
  caption: string;
}

export interface Concert {
  id: string;
  artist: string;
  showName: string; // tour / event name, distinct from the artist
  venue: string;
  date: string;
  comment: string;
  ticketUrl: string | null; // signed URL for display
  ticketCaption: string;
  photos: Photo[];
  spotify: SpotifyItem | null;
  favorite: boolean;
}

export interface ConcertDraft {
  artist: string;
  showName: string;
  venue: string;
  date: string;
  comment: string;
  ticketDataUrl: string | null;
  ticketCaption: string;
  photos: { dataUrl: string; caption: string }[];
  spotify: SpotifyItem | null;
}

const TICKETS_BUCKET = "tickets";
const PHOTOS_BUCKET = "photos";
const SIGNED_TTL = 60 * 60; // 1 hour

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function uploadDataUrl(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  dataUrl: string
) {
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
  if (error) throw error;
}

async function signedUrl(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

// ─── Reads ────────────────────────────────────────────────────────────────────

interface PhotoRow {
  photo_url: string;
  order_index: number;
  caption: string | null;
}
interface SpotifyRow {
  spotify_type: string;
  spotify_id: string;
  name: string;
  artist: string;
  cover_url: string | null;
  external_url: string | null;
}
interface ConcertRow {
  id: string;
  artist_name: string;
  show_name: string | null;
  venue: string;
  concert_date: string | null;
  ticket_url: string | null;
  ticket_caption: string | null;
  notes: string;
  favorite: boolean;
  created_at: string;
  concert_photos: PhotoRow[] | null;
  concert_spotify: SpotifyRow[] | SpotifyRow | null;
}

export async function loadConcerts(): Promise<Concert[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select(
      "id, artist_name, show_name, venue, concert_date, ticket_url, ticket_caption, notes, favorite, created_at, " +
        "concert_photos(photo_url, order_index, caption), " +
        "concert_spotify(spotify_type, spotify_id, name, artist, cover_url, external_url)"
    )
    .order("concert_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as ConcertRow[];

  return Promise.all(
    rows.map(async (row) => {
      const ticketUrl = await signedUrl(supabase, TICKETS_BUCKET, row.ticket_url);

      const photoRows = (row.concert_photos ?? []).slice().sort((a, b) => a.order_index - b.order_index);
      const photos: Photo[] = (
        await Promise.all(
          photoRows.map(async (p) => {
            const url = await signedUrl(supabase, PHOTOS_BUCKET, p.photo_url);
            return url ? { url, caption: p.caption ?? "" } : null;
          })
        )
      ).filter((p): p is Photo => p !== null);

      const sp = Array.isArray(row.concert_spotify) ? row.concert_spotify[0] : row.concert_spotify;
      const spotify: SpotifyItem | null = sp
        ? {
            id: sp.spotify_id,
            name: sp.name,
            artist: sp.artist,
            type: sp.spotify_type,
            coverUrl: sp.cover_url,
            externalUrl: sp.external_url,
          }
        : null;

      return {
        id: row.id,
        artist: row.artist_name,
        showName: row.show_name ?? "",
        venue: row.venue,
        date: row.concert_date ?? "",
        comment: row.notes,
        ticketUrl,
        ticketCaption: row.ticket_caption ?? "",
        photos,
        spotify,
        favorite: row.favorite,
      };
    })
  );
}

// ─── Writes ───────────────────────────────────────────────────────────────────

async function requireUserId(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function createConcert(draft: ConcertDraft): Promise<void> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);

  const { data: inserted, error } = await supabase
    .from("concerts")
    .insert({
      user_id: userId,
      artist_name: draft.artist.trim() || "untitled show",
      show_name: draft.showName.trim(),
      venue: draft.venue.trim(),
      concert_date: draft.date || null,
      notes: draft.comment.trim(),
      favorite: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  const concertId = inserted.id as string;

  if (draft.ticketDataUrl) {
    const path = `${userId}/${concertId}/ticket`;
    await uploadDataUrl(supabase, TICKETS_BUCKET, path, draft.ticketDataUrl);
    await supabase
      .from("concerts")
      .update({ ticket_url: path, ticket_caption: draft.ticketCaption.trim() })
      .eq("id", concertId);
  }

  const photos = draft.photos.filter((p) => p.dataUrl).slice(0, 10);
  for (let i = 0; i < photos.length; i++) {
    const path = `${userId}/${concertId}/photo-${i}`;
    await uploadDataUrl(supabase, PHOTOS_BUCKET, path, photos[i].dataUrl);
    await supabase.from("concert_photos").insert({
      concert_id: concertId,
      photo_url: path,
      order_index: i,
      caption: photos[i].caption.trim(),
    });
  }

  if (draft.spotify) {
    await supabase.from("concert_spotify").insert({
      concert_id: concertId,
      spotify_type: draft.spotify.type === "playlist" ? "playlist" : "album",
      spotify_id: draft.spotify.id,
      name: draft.spotify.name,
      artist: draft.spotify.artist,
      cover_url: draft.spotify.coverUrl,
      external_url: draft.spotify.externalUrl,
    });
  }
}

export async function setFavorite(concertId: string, favorite: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("concerts").update({ favorite }).eq("id", concertId);
  if (error) throw error;
}

export async function deleteAllConcerts(): Promise<void> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase.from("concerts").delete().eq("user_id", userId);
  if (error) throw error;
}

// Metadata-only import (artist / venue / date / comment / favorite). Images and
// Spotify links are not restored from an export.
export async function importConcertsMeta(
  items: { artist: string; venue: string; date: string; comment: string; favorite: boolean }[]
): Promise<void> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  if (items.length === 0) return;
  const rows = items.map((c) => ({
    user_id: userId,
    artist_name: c.artist.trim() || "untitled show",
    venue: c.venue.trim(),
    concert_date: c.date || null,
    notes: c.comment.trim(),
    favorite: Boolean(c.favorite),
  }));
  const { error } = await supabase.from("concerts").insert(rows);
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// ─── User profile (display name stored in auth metadata) ──────────────────────

export interface UserProfile {
  email: string;
  name: string;
  goal: number | null; // personal target number of shows; null = use auto goal
}

export async function loadUserProfile(): Promise<UserProfile> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const name = (user?.user_metadata?.display_name as string | undefined) ?? "";
  const goalRaw = user?.user_metadata?.shows_goal;
  const goal = typeof goalRaw === "number" && goalRaw > 0 ? Math.floor(goalRaw) : null;
  return { email: user?.email ?? "", name, goal };
}

export async function setDisplayName(name: string): Promise<void> {
  const supabase = createClient();
  const trimmed = name.trim();
  const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } });
  if (error) throw error;

  // Keep the public profile row in step — it, not auth metadata, is what other
  // users will read once sharing lands.
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await supabase.from("profiles").update({ display_name: trimmed }).eq("id", data.user.id);
  }
}

// Personal shows goal, stored in auth metadata. Pass null to clear it (revert to auto).
export async function setShowsGoal(goal: number | null): Promise<void> {
  const supabase = createClient();
  const value = goal && goal > 0 ? Math.floor(goal) : null;
  const { error } = await supabase.auth.updateUser({ data: { shows_goal: value } });
  if (error) throw error;
}

// ─── Spotify search (via the server proxy) ────────────────────────────────────

export async function searchSpotify(query: string): Promise<SpotifyItem[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("search failed");
  const data = (await res.json()) as { results: SpotifyItem[] };
  return data.results ?? [];
}

// Detects a Spotify album/playlist link (URL or spotify: URI) and returns its id.
export function parseSpotifyLink(text: string): { type: "album" | "playlist"; id: string } | null {
  const t = text.trim();
  const m = t.match(/(?:open\.spotify\.com\/(?:intl-[a-z]+\/)?|spotify:)(album|playlist)[/:]([A-Za-z0-9]+)/i);
  if (!m) return null;
  return { type: m[1].toLowerCase() as "album" | "playlist", id: m[2] };
}

export async function lookupSpotify(type: "album" | "playlist", id: string): Promise<SpotifyItem | null> {
  const res = await fetch(`/api/spotify/lookup?type=${type}&id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: SpotifyItem };
  return data.result ?? null;
}

// ─── AI concert note ──────────────────────────────────────────────────────────

export interface GenerateNoteInput {
  artist: string;
  venue: string;
  date: string;
  tone: string;
  captions: string[];
}

export async function generateNote(input: GenerateNoteInput): Promise<string> {
  const res = await fetch("/api/generate-note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "couldn't generate a note");
  }
  return (data.note as string) ?? "";
}
