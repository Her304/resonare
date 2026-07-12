"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type Concert,
  type UserProfile,
  type ConcertDraft,
  loadConcerts,
  loadUserProfile,
  setFavorite,
  deleteAllConcerts,
  importConcertsMeta,
  setDisplayName,
  setShowsGoal,
  createConcert,
  signOut,
} from "@/lib/concerts";
import type { ImportMeta } from "./Resonare";

interface Store {
  concerts: Concert[];
  profile: UserProfile;
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  importConcerts: (items: ImportMeta[]) => Promise<void>;
  resetConcerts: () => Promise<void>;
  renameUser: (name: string) => Promise<void>;
  updateGoal: (goal: number | null) => Promise<void>;
  addConcert: (draft: ConcertDraft) => Promise<void>;
  doSignOut: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const store = useContext(Ctx);
  if (!store) throw new Error("useStore must be used within <AppStoreProvider>");
  return store;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ email: "", name: "", goal: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [data, prof] = await Promise.all([loadConcerts(), loadUserProfile()]);
      setConcerts(data);
      setProfile(prof);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "couldn't load your concerts");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const target = concerts.find((c) => c.id === id);
      if (!target) return;
      const next = !target.favorite;
      setConcerts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: next } : c)));
      try {
        await setFavorite(id, next);
      } catch {
        setConcerts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !next } : c)));
      }
    },
    [concerts]
  );

  const importConcerts = useCallback(
    async (items: ImportMeta[]) => {
      try {
        await importConcertsMeta(items);
        await reload();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "import failed");
      }
    },
    [reload]
  );

  const resetConcerts = useCallback(async () => {
    try {
      await deleteAllConcerts();
      await reload();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "reset failed");
    }
  }, [reload]);

  const renameUser = useCallback(async (name: string) => {
    setProfile((p) => ({ ...p, name }));
    try {
      await setDisplayName(name);
    } catch {
      try {
        setProfile(await loadUserProfile());
      } catch {
        /* ignore */
      }
    }
  }, []);

  const updateGoal = useCallback(async (goal: number | null) => {
    setProfile((p) => ({ ...p, goal }));
    try {
      await setShowsGoal(goal);
    } catch {
      try {
        setProfile(await loadUserProfile());
      } catch {
        /* ignore */
      }
    }
  }, []);

  const addConcert = useCallback(
    async (draft: ConcertDraft) => {
      await createConcert(draft);
      await reload();
    },
    [reload]
  );

  const doSignOut = useCallback(async () => {
    await signOut();
    window.location.href = "/login";
  }, []);

  const value: Store = {
    concerts,
    profile,
    loading,
    loadError,
    reload,
    toggleFavorite,
    importConcerts,
    resetConcerts,
    renameUser,
    updateGoal,
    addConcert,
    doSignOut,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
