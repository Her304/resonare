import { NextResponse } from "next/server";

// Generates a short concert-diary reflection from the show details + photo captions.
// Uses OpenAI; the key stays server-side.

interface Body {
  artist?: string;
  venue?: string;
  date?: string;
  tone?: string;
  captions?: string[];
}

const TONE_HINTS: Record<string, string> = {
  chill: "relaxed, understated, easygoing",
  poetic: "lyrical and image-rich, with gentle rhythm",
  abstract: "impressionistic and dreamy, more feeling than fact",
  nostalgic: "wistful and warm, looking back fondly",
  hyped: "energetic and electric, buzzing with excitement",
};

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OpenAI key not configured" }, { status: 500 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const artist = (body.artist || "").trim() || "an artist";
  const venue = (body.venue || "").trim();
  const date = (body.date || "").trim();
  const tone = (body.tone || "chill").trim().toLowerCase();
  const captions = (body.captions || []).map((c) => c.trim()).filter(Boolean);
  const toneHint = TONE_HINTS[tone] ?? tone;

  const details = [
    `Artist: ${artist}`,
    venue ? `Venue: ${venue}` : "",
    date ? `Date: ${date}` : "",
    captions.length ? `Photo captions from the night:\n- ${captions.join("\n- ")}` : "No photo captions provided.",
  ]
    .filter(Boolean)
    .join("\n");

  const system =
    "You write short first-person concert diary entries — the kind someone jots down to remember a night. " +
    "2 to 3 sentences, roughly 35-60 words. Personal, specific, sensory. " +
    "Draw on the provided photo captions and details as raw material. " +
    "No hashtags, no emoji, no quotation marks around the whole thing, no title. Just the reflection.";

  const user = `Write a concert memory in a ${toneHint} tone.\n\n${details}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.9,
        max_tokens: 160,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "generation_failed", detail: detail.slice(0, 200) }, { status: 502 });
    }

    const data = await res.json();
    const note = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!note) {
      return NextResponse.json({ error: "empty_response" }, { status: 502 });
    }
    return NextResponse.json({ note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
