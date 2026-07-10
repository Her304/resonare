// Server-only Spotify helpers (Client Credentials flow). Never import from client code.

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

export async function getSpotifyToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 5_000) {
    return cached.token;
  }

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("Spotify credentials are not configured");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spotify token request failed (${res.status})`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export interface SpotifyResult {
  id: string;
  type: "album" | "playlist";
  name: string;
  artist: string;
  coverUrl: string | null;
  externalUrl: string | null;
}
