"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppStoreProvider, useStore } from "@/components/AppStore";
import { BottomNav } from "@/components/Resonare";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center py-9"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #0F5E5E 0%, #082F2F 55%, #061f1f 100%)" }}
    >
      <AppStoreProvider>
        <PhoneShell>{children}</PhoneShell>
      </AppStoreProvider>
    </main>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  const { loading, loadError, reload } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const onHome = pathname === "/home";
  const onProfile = pathname === "/profile";
  const showNav = (onHome || onProfile) && !loading && !loadError;

  return (
    <div
      style={{
        width: 430,
        height: "min(860px, calc(100dvh - 72px))",
        background: "#0F5E5E",
        borderRadius: 40,
        overflow: "hidden",
        position: "relative",
        // Establishes the containing block for position:fixed overlays (lightboxes,
        // stat sheet) so they pin to the phone frame and clip to its rounded corners.
        transform: "translateZ(0)",
        border: "1px solid rgba(242,236,224,0.14)",
        boxShadow: "0 40px 80px -24px rgba(2,16,16,0.65), 0 0 0 1px rgba(242,236,224,0.05)",
      }}
    >
      <div className="phone-scroll" style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        {loading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(242,236,224,0.6)", fontFamily: "var(--font-inter), sans-serif", fontSize: 14 }}>
            loading your concerts…
          </div>
        ) : loadError ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
            <div style={{ color: "#F2ECE0", fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 17 }}>couldn&rsquo;t load</div>
            <div style={{ color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif", fontSize: 12.5 }}>{loadError}</div>
            <div
              onClick={() => reload()}
              className="r-pressable"
              style={{ background: "#FF6B35", color: "#F2ECE0", padding: "10px 22px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter), sans-serif" }}
            >
              retry
            </div>
          </div>
        ) : (
          children
        )}
      </div>
      {showNav && (
        <BottomNav
          active={onProfile ? "profile" : "home"}
          onNavigate={(tab) => router.push(`/${tab}`)}
          onAdd={() => router.push("/log")}
        />
      )}
      <div className="r-grain" />
    </div>
  );
}
