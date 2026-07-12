"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/components/AppStore";
import { ProfileScreen } from "@/components/Resonare";

export default function ProfilePage() {
  const router = useRouter();
  const { concerts, profile, importConcerts, resetConcerts, doSignOut, renameUser, updateGoal } = useStore();

  return (
    <ProfileScreen
      concerts={concerts}
      profile={profile}
      onOpenConcert={(id) => router.push(`/concerts/${id}`)}
      onImport={importConcerts}
      onReset={resetConcerts}
      onSignOut={doSignOut}
      onRename={renameUser}
      onSetGoal={updateGoal}
    />
  );
}
