"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/components/AppStore";
import { DetailScreen, Lightbox } from "@/components/Resonare";

export default function ConcertDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { concerts, toggleFavorite } = useStore();
  const [lightbox, setLightbox] = useState<{ url: string; caption: string } | null>(null);

  const concert = concerts.find((c) => c.id === params.id) ?? null;

  if (!concert) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
        <div style={{ color: "#F2ECE0", fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 17 }}>show not found</div>
        <div
          onClick={() => router.push("/home")}
          className="r-pressable"
          style={{ background: "#FF6B35", color: "#F2ECE0", padding: "10px 22px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter), sans-serif" }}
        >
          back to shows
        </div>
      </div>
    );
  }

  return (
    <>
      <DetailScreen
        concert={concert}
        onBack={() => router.back()}
        onToggleFavorite={toggleFavorite}
        onEnlarge={(url, caption) => setLightbox({ url, caption })}
      />
      {lightbox && <Lightbox url={lightbox.url} caption={lightbox.caption} editable={false} onClose={() => setLightbox(null)} />}
    </>
  );
}
