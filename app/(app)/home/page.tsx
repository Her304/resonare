"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/components/AppStore";
import { HomeScreen } from "@/components/Resonare";

export default function HomePage() {
  const router = useRouter();
  const { concerts, toggleFavorite } = useStore();

  return (
    <HomeScreen
      concerts={concerts}
      onOpenConcert={(id) => router.push(`/concerts/${id}`)}
      onToggleFavorite={toggleFavorite}
    />
  );
}
