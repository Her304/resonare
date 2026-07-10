import { NextResponse } from "next/server";
import { getSpotifyToken, type SpotifyResult } from "@/lib/spotify-server";

// Resolves a single album/playlist by id (e.g. from a pasted Spotify link).

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id")?.trim();

  if ((type !== "album" && type !== "playlist") || !id) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const token = await getSpotifyToken();
    const endpoint = type === "album" ? `albums/${id}` : `playlists/${id}`;
    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    }

    const d = await res.json();
    const result: SpotifyResult = {
      id: d.id,
      type,
      name: d.name,
      artist:
        type === "album"
          ? (d.artists ?? []).map((a: { name: string }) => a.name).join(", ")
          : (d.owner?.display_name ?? ""),
      coverUrl: d.images?.[0]?.url ?? null,
      externalUrl: d.external_urls?.spotify ?? null,
    };

    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
