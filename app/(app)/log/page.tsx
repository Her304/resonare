"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/AppStore";
import { LogScreen, Lightbox, EMPTY_DRAFT, type Draft } from "@/components/Resonare";
import { searchSpotify, parseSpotifyLink, lookupSpotify, generateNote, type SpotifyItem } from "@/lib/concerts";

export default function LogPage() {
  const router = useRouter();
  const { addConcert } = useStore();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [logStep, setLogStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [spotifyQuery, setSpotifyQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState<SpotifyItem[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);

  const [lightbox, setLightbox] = useState<{ kind: "ticket" } | { kind: "photo"; index: number } | null>(null);

  // Debounced Spotify search (mirrors the standalone-app behaviour).
  useEffect(() => {
    const q = spotifyQuery.trim();
    if (!q) {
      setSpotifyResults([]);
      setSpotifyLoading(false);
      return;
    }
    setSpotifyLoading(true);
    let cancelled = false;
    const link = parseSpotifyLink(q);
    const t = setTimeout(async () => {
      try {
        if (link) {
          const item = await lookupSpotify(link.type, link.id);
          if (!cancelled) setSpotifyResults(item ? [item] : []);
        } else {
          const res = await searchSpotify(q);
          if (!cancelled) setSpotifyResults(res);
        }
      } catch {
        if (!cancelled) setSpotifyResults([]);
      } finally {
        if (!cancelled) setSpotifyLoading(false);
      }
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [spotifyQuery]);

  function logBack() {
    if (logStep > 1) setLogStep((s) => s - 1);
    else router.push("/home");
  }

  async function logNext() {
    if (logStep < 4) {
      setLogStep((s) => s + 1);
      return;
    }
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await addConcert({
        artist: draft.artist,
        showName: draft.showName,
        venue: draft.venue,
        date: draft.date,
        comment: draft.comment,
        ticketDataUrl: draft.ticketUrl,
        ticketCaption: draft.ticketCaption,
        photos: draft.photos.filter((p) => p.dataUrl),
        spotify: draft.spotify,
      });
      router.push("/home");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <LogScreen
        draft={draft}
        step={logStep}
        spotifyQuery={spotifyQuery}
        spotifyResults={spotifyResults}
        spotifyLoading={spotifyLoading}
        saving={saving}
        saveError={saveError}
        onBack={logBack}
        onNext={logNext}
        onDraftChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSpotifyQuery={setSpotifyQuery}
        onPickSpotify={(item) => setDraft((d) => ({ ...d, spotify: item }))}
        onClearSpotify={() => setDraft((d) => ({ ...d, spotify: null }))}
        onTicketFile={(url) => setDraft((d) => ({ ...d, ticketUrl: url }))}
        onEnlargeTicket={() => draft.ticketUrl && setLightbox({ kind: "ticket" })}
        onAddPhoto={(url) =>
          setDraft((d) => (d.photos.length >= 10 ? d : { ...d, photos: [...d.photos, { dataUrl: url, caption: "" }] }))
        }
        onPhotoCaption={(i, caption) =>
          setDraft((d) => {
            const photos = [...d.photos];
            if (photos[i]) photos[i] = { ...photos[i], caption };
            return { ...d, photos };
          })
        }
        onRemovePhoto={(i) => setDraft((d) => ({ ...d, photos: d.photos.filter((_, idx) => idx !== i) }))}
        onEnlargePhoto={(i) => draft.photos[i] && setLightbox({ kind: "photo", index: i })}
        onGenerateNote={(tone) =>
          generateNote({
            artist: draft.artist,
            venue: draft.venue,
            date: draft.date,
            tone,
            captions: [
              ...(draft.ticketCaption ? [draft.ticketCaption] : []),
              ...draft.photos.map((p) => p.caption).filter(Boolean),
            ],
          })
        }
      />

      {lightbox &&
        (() => {
          if (lightbox.kind === "ticket") {
            if (!draft.ticketUrl) return null;
            return (
              <Lightbox
                url={draft.ticketUrl}
                caption={draft.ticketCaption}
                editable
                onCaptionChange={(val) => setDraft((d) => ({ ...d, ticketCaption: val }))}
                onReplace={(url) => setDraft((d) => ({ ...d, ticketUrl: url }))}
                onRemove={() => {
                  setDraft((d) => ({ ...d, ticketUrl: null, ticketCaption: "" }));
                  setLightbox(null);
                }}
                onClose={() => setLightbox(null)}
              />
            );
          }
          const photo = draft.photos[lightbox.index];
          if (!photo) return null;
          return (
            <Lightbox
              url={photo.dataUrl}
              caption={photo.caption}
              editable
              onCaptionChange={(val) =>
                setDraft((d) => {
                  const photos = [...d.photos];
                  const p = photos[lightbox.index];
                  if (p) photos[lightbox.index] = { ...p, caption: val };
                  return { ...d, photos };
                })
              }
              onReplace={(url) =>
                setDraft((d) => {
                  const photos = [...d.photos];
                  const p = photos[lightbox.index];
                  photos[lightbox.index] = { dataUrl: url, caption: p?.caption ?? "" };
                  return { ...d, photos };
                })
              }
              onRemove={() => {
                setDraft((d) => ({ ...d, photos: d.photos.filter((_, idx) => idx !== lightbox.index) }));
                setLightbox(null);
              }}
              onClose={() => setLightbox(null)}
            />
          );
        })()}
    </>
  );
}
