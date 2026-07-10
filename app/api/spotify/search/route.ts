import { NextResponse } from "next/server";
import { getSpotifyToken, type SpotifyResult } from "@/lib/spotify-server";

interface SpotifyImage {
  url: string;
}
interface AlbumItem {
  id: string;
  name: string;
  images: SpotifyImage[];
  artists: { name: string }[];
  external_urls: { spotify: string };
}
interface PlaylistItem {
  id: string;
  name: string;
  images: SpotifyImage[];
  owner: { display_name: string };
  external_urls: { spotify: string };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const token = await getSpotifyToken();
    const url = new URL("https://api.spotify.com/v1/search");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "album,playlist");
    url.searchParams.set("limit", "8");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "search_failed" }, { status: 502 });
    }

    const data = await res.json();

    const albums: SpotifyResult[] = (data.albums?.items ?? []).filter(Boolean).map((a: AlbumItem) => ({
      id: a.id,
      type: "album",
      name: a.name,
      artist: a.artists?.map((x) => x.name).join(", ") ?? "",
      coverUrl: a.images?.[0]?.url ?? null,
      externalUrl: a.external_urls?.spotify ?? null,
    }));

    const playlists: SpotifyResult[] = (data.playlists?.items ?? []).filter(Boolean).map((p: PlaylistItem) => ({
      id: p.id,
      type: "playlist",
      name: p.name,
      artist: p.owner?.display_name ?? "",
      coverUrl: p.images?.[0]?.url ?? null,
      externalUrl: p.external_urls?.spotify ?? null,
    }));

    const results: SpotifyResult[] = [];
    const max = Math.max(albums.length, playlists.length);
    for (let i = 0; i < max; i++) {
      if (albums[i]) results.push(albums[i]);
      if (playlists[i]) results.push(playlists[i]);
    }

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
