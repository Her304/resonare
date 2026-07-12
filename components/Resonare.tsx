"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { type SpotifyItem, type Concert, type UserProfile } from "@/lib/concerts";

// Leaflet touches `window`, so the map is client-only (no SSR).
const ConcertMap = dynamic(() => import("./ConcertMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 260, borderRadius: 18, background: "rgba(242,236,224,0.06)" }} />
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cityFromVenue(venue: string) {
  const parts = venue.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : venue;
}

function prettyDate(iso: string) {
  if (!iso) return "date tbd";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STEP_TITLES = ["the show", "the memories", "the soundtrack", "the feeling"];

export interface DraftPhoto {
  dataUrl: string;
  caption: string;
}

export interface Draft {
  artist: string;
  showName: string;
  venue: string;
  date: string;
  spotify: SpotifyItem | null;
  comment: string;
  ticketUrl: string | null; // data URL while editing
  ticketCaption: string;
  photos: DraftPhoto[]; // data URLs while editing
}

const TONES = ["chill", "poetic", "abstract", "nostalgic", "hyped"];

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconHome({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.2L12 4l8 7.2" />
      <path d="M5.5 9.8V19a1 1 0 001 1H10v-5.5h4V20h3.5a1 1 0 001-1V9.8" />
    </svg>
  );
}

function IconClose({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.2" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </svg>
  );
}

function IconChevronLeft({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function IconChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconTicket({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1.2a1.6 1.6 0 000 3.2V15a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.6a1.6 1.6 0 000-3.2V9z" />
      <path d="M9 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

function IconCamera({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

function IconMusicNote({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </svg>
  );
}

function IconPen({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l4.2-.9L18.8 8.4a1.8 1.8 0 000-2.5l-.7-.7a1.8 1.8 0 00-2.5 0L5 15.8 4 20z" />
      <path d="M14 6.4l3.2 3.2" />
    </svg>
  );
}

const STEP_ICON_NAMES = ["confirmation_number", "camera_roll", "art_track", "edit_square"];

// Google Material Symbols (loaded in app/layout.tsx). Ligature renders the glyph.
function MaterialIcon({ name, size = 22, fill = 0, weight = 500 }: { name: string; size?: number; fill?: number; weight?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        userSelect: "none",
      }}
    >
      {name}
    </span>
  );
}

// Favorite / decorative star (Material Symbols). Orange when filled, else inherits color.
function Star({ size = 18, filled = false, color }: { size?: number; filled?: boolean; color?: string }) {
  return (
    <span style={{ color: color ?? (filled ? "#FF6B35" : "currentColor"), display: "inline-flex" }}>
      <MaterialIcon name="star" size={size} fill={filled ? 1 : 0} />
    </span>
  );
}

// ─── Small shared pieces ───────────────────────────────────────────────────────

function ImageSlot({
  url,
  placeholder,
  className,
  style,
  onFile,
  onClickFilled,
  icon,
}: {
  url: string | null;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
  onFile?: (dataUrl: string) => void;
  onClickFilled?: () => void;
  icon?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (url && onClickFilled) {
      onClickFilled();
      return;
    }
    if (onFile) inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const interactive = (url && onClickFilled) || onFile;

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{
        background: url ? undefined : "rgba(242,236,224,0.08)",
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: interactive ? "pointer" : "default",
        border: "1px dashed rgba(242,236,224,0.2)",
        ...style,
      }}
    >
      {!url && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(242,236,224,0.45)" }}>
          {icon}
          <span style={{ fontSize: 12, fontFamily: "var(--font-inter), sans-serif" }}>{placeholder}</span>
        </div>
      )}
      {onFile && (
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
      )}
    </div>
  );
}

// Clickable wrapper that opens a file picker and returns a data URL.
function FilePicker({
  onFile,
  className,
  style,
  children,
}: {
  onFile: (dataUrl: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => onFile(ev.target?.result as string);
    r.readAsDataURL(f);
  }
  return (
    <div onClick={() => ref.current?.click()} className={className} style={{ cursor: "pointer", ...style }}>
      {children}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
    </div>
  );
}

// Full-screen image viewer with an optional editable caption.
export function Lightbox({
  url,
  caption,
  editable,
  onCaptionChange,
  onReplace,
  onRemove,
  onClose,
}: {
  url: string;
  caption: string;
  editable: boolean;
  onCaptionChange?: (c: string) => void;
  onReplace?: (dataUrl: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  const replaceRef = useRef<HTMLInputElement>(null);

  function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onReplace) return;
    const reader = new FileReader();
    reader.onload = (ev) => onReplace(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,16,16,0.94)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        {editable && onRemove ? (
          <div
            onClick={onRemove}
            className="r-pressable"
            style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,107,53,0.9)", cursor: "pointer", fontFamily: "var(--font-inter), sans-serif", padding: "6px 8px" }}
          >
            remove
          </div>
        ) : (
          <div style={{ width: 40 }} />
        )}
        <div
          onClick={onClose}
          className="r-pressable"
          style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#F2ECE0", cursor: "pointer", background: "rgba(242,236,224,0.1)" }}
        >
          <IconClose size={20} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px", minHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={caption || "concert photo"} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 14, objectFit: "contain" }} />
      </div>

      <div style={{ padding: "18px 20px 26px" }}>
        {editable ? (
          <>
            <input
              value={caption}
              onChange={(e) => onCaptionChange?.(e.target.value)}
              placeholder="add a caption…"
              maxLength={140}
              className="r-input"
              style={{
                width: "100%",
                background: "rgba(242,236,224,0.08)",
                border: "1px solid rgba(242,236,224,0.2)",
                borderRadius: 12,
                color: "#F2ECE0",
                fontFamily: "var(--font-noto-serif-jp), serif",
                fontStyle: "italic",
                fontSize: 15,
                padding: "12px 14px",
                outline: "none",
              }}
            />
            {onReplace && (
              <div
                onClick={() => replaceRef.current?.click()}
                className="r-pressable"
                style={{ marginTop: 12, textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "rgba(242,236,224,0.7)", cursor: "pointer", fontFamily: "var(--font-inter), sans-serif" }}
              >
                replace photo
                <input ref={replaceRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleReplace} />
              </div>
            )}
          </>
        ) : caption ? (
          <div style={{ color: "#F2ECE0", fontFamily: "var(--font-noto-serif-jp), serif", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.5, textAlign: "center" }}>
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Album/playlist artwork — cover image when available, neutral tile otherwise.
function SpotifyArt({ url, size, radius }: { url: string | null; size: number; radius: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        overflow: "hidden",
        background: url ? undefined : "rgba(15,94,94,0.14)",
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(15,94,94,0.45)",
      }}
    >
      {!url && <IconMusicNote size={Math.round(size * 0.48)} />}
    </div>
  );
}

function SpotifyBadge({ item }: { item: SpotifyItem }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(15,94,94,0.07)",
        borderRadius: 999,
        padding: "3px 10px 3px 3px",
        width: "fit-content",
        marginTop: 2,
      }}
    >
      <SpotifyArt url={item.coverUrl} size={18} radius={4} />
      <div
        style={{
          fontSize: 11,
          color: "#1a1816",
          whiteSpace: "nowrap",
          maxWidth: 150,
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {item.name}
      </div>
    </div>
  );
}

function StatRing({ value, max, size = 64, strokeWidth = 6 }: { value: number; max: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const offset = circumference * (1 - progress);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(26,24,22,0.12)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FF6B35"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: size * 0.3, color: "#1a1816", lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub, progress, onClick }: { label: string; value: string | number; sub?: string; progress?: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "r-pressable" : undefined}
      style={{ flex: 1, background: "#F2ECE0", border: "1px solid rgba(15,94,94,0.16)", borderRadius: 16, padding: "12px 14px", minWidth: 0, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 20, color: "#1a1816", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 10.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {sub}
        </div>
      )}
      {typeof progress === "number" && (
        <div style={{ height: 3, borderRadius: 2, background: "rgba(15,94,94,0.14)", marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, progress * 100)}%`, background: "#FF6B35", borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

export function BottomNav({
  active,
  onNavigate,
  onAdd,
}: {
  active: "home" | "profile";
  onNavigate: (tab: "home" | "profile") => void;
  onAdd: () => void;
}) {
  const tabBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    height: 48,
    padding: "0 22px",
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "var(--font-inter), sans-serif",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        background: "transparent",
      }}
    >
      {/* glass pill holding the tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          borderRadius: 999,
          background: "rgba(11,66,66,0.5)",
          backdropFilter: "blur(18px) saturate(1.3)",
          WebkitBackdropFilter: "blur(18px) saturate(1.3)",
          border: "1px solid rgba(242,236,224,0.14)",
          boxShadow: "0 8px 20px rgba(4,30,30,0.28), inset 0 1px 0 rgba(242,236,224,0.08)",
        }}
      >
        <div
          onClick={() => onNavigate("home")}
          className="r-pressable"
          style={{
            ...tabBase,
            background: active === "home" ? "#F2ECE0" : "transparent",
            color: active === "home" ? "#1a1816" : "#F2ECE0",
            opacity: active === "home" ? 1 : 0.55,
          }}
        >
          <MaterialIcon name="home" size={20} fill={active === "home" ? 1 : 0} />
          <div style={{ fontSize: 13.5, fontWeight: active === "home" ? 600 : 500 }}>home</div>
        </div>
        <div
          onClick={() => onNavigate("profile")}
          className="r-pressable"
          style={{
            ...tabBase,
            background: active === "profile" ? "#F2ECE0" : "transparent",
            color: active === "profile" ? "#1a1816" : "#F2ECE0",
            opacity: active === "profile" ? 1 : 0.55,
          }}
        >
          <MaterialIcon name="stadium" size={20} fill={active === "profile" ? 1 : 0} />
          <div style={{ fontSize: 13.5, fontWeight: active === "profile" ? 600 : 500 }}>profile</div>
        </div>
      </div>

      <div
        onClick={onAdd}
        className="r-pressable"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#FF6B35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#F2ECE0",
          userSelect: "none",
          boxShadow: "0 3px 8px rgba(255,107,53,0.24)",
        }}
      >
        <MaterialIcon name="add" size={28} weight={400} />
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export function HomeScreen({
  concerts,
  onOpenConcert,
  onToggleFavorite,
}: {
  concerts: Concert[];
  onOpenConcert: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "year" | "favorites">("all");

  const currentYear = String(new Date().getFullYear());
  const totalShows = concerts.length;
  const uniqueArtists = new Set(concerts.map((c) => c.artist)).size;
  const uniqueCities = new Set(concerts.map((c) => cityFromVenue(c.venue))).size;
  const goal = Math.max(5, Math.ceil((totalShows + 1) / 5) * 5);
  const latest = [...concerts].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  const q = search.trim().toLowerCase();
  const filtered = concerts
    .filter((c) => !q || c.artist.toLowerCase().includes(q) || c.venue.toLowerCase().includes(q))
    .filter((c) => {
      if (filter === "year") return c.date.startsWith(currentYear);
      if (filter === "favorites") return c.favorite;
      return true;
    });

  const FILTERS: { key: "all" | "year" | "favorites"; label: string }[] = [
    { key: "all", label: "all" },
    { key: "year", label: currentYear },
    { key: "favorites", label: "favorites" },
  ];

  return (
    <div style={{ minHeight: "100%" }}>
      <br />
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "26px 22px 18px" }}>
        <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 36, letterSpacing: "-0.4px", color: "#F2ECE0" }}>
          resonare
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "rgba(242,236,224,0.55)", textTransform: "uppercase", fontFamily: "var(--font-inter), sans-serif" }}>
          stamped in, played out
        </div>
      </div>

      <div style={{ padding: "0 20px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Atlas summary card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#F2ECE0",
            border: "1px solid rgba(15,94,94,0.16)",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 10px 24px rgba(4,30,30,0.28)",
          }}
        >
          <StatRing value={totalShows} max={goal} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 16.5, color: "#1a1816", lineHeight: 1.25 }}>
              {totalShows} of {goal} shows logged
            </div>
            <div style={{ fontSize: 12, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginTop: 4 }}>
              {uniqueArtists} artists · {uniqueCities} cities explored
            </div>
          </div>
        </div>

        {/* Recently stamped callout */}
        {latest && (
          <div
            onClick={() => onOpenConcert(latest.id)}
            className="r-pressable"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(242,236,224,0.94)",
              border: "1px solid rgba(15,94,94,0.16)",
              borderRadius: 16,
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={17} filled color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif" }}>
                recently stamped
              </div>
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#1a1816", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {latest.artist} — {cityFromVenue(latest.venue)}
              </div>
            </div>
            <IconChevronRight size={16} />
          </div>
        )}

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(242,236,224,0.94)",
            border: "1px solid rgba(15,94,94,0.16)",
            borderRadius: 999,
            padding: "11px 16px",
            marginTop: 4,
            color: "#1a1816",
          }}
        >
          <IconSearch size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search artist or venue"
            className="r-input"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#1a1816", fontFamily: "var(--font-inter), sans-serif" }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <div
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="r-pressable"
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 600,
                  background: active ? "#F2ECE0" : "rgba(242,236,224,0.1)",
                  color: active ? "#1a1816" : "rgba(242,236,224,0.7)",
                  border: `1px solid ${active ? "transparent" : "rgba(242,236,224,0.18)"}`,
                }}
              >
                {f.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Concert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 20px 120px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>
          your shows · {filtered.length}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "40px 10px", textAlign: "center", color: "rgba(242,236,224,0.5)", fontFamily: "var(--font-inter), sans-serif", fontSize: 13 }}>
            {concerts.length === 0
              ? "no shows yet — tap + to log your first"
              : `no shows match${search ? ` "${search}"` : " this filter"}`}
          </div>
        )}

        {filtered.map((c) => {
          const cover = c.photos[0]?.url ?? c.ticketUrl ?? null;
          const city = cityFromVenue(c.venue);
          const meta = [city, prettyDate(c.date)].filter(Boolean).join(" · ");
          return (
            <div
              key={c.id}
              onClick={() => onOpenConcert(c.id)}
              className="r-pressable"
              style={{
                position: "relative",
                height: 168,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid rgba(15,94,94,0.16)",
                background: cover ? undefined : "linear-gradient(135deg, #0F5E5E, #082F2F)",
                backgroundImage: cover ? `url(${cover})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!cover && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(242,236,224,0.25)" }}>
                  <IconTicket size={40} />
                </div>
              )}

              {/* dark gradient so the white text stays legible */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 68%)",
                }}
              />

              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 19, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                      {c.showName || c.artist}
                    </div>
                    {c.showName && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", fontFamily: "var(--font-noto-serif-jp), serif", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                        {c.artist}
                      </div>
                    )}
                    {meta && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,1)", fontFamily: "var(--font-inter), sans-serif", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {meta}
                      </div>
                    )}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(c.id);
                    }}
                    className="r-pressable"
                    style={{ padding: 2, cursor: "pointer", flexShrink: 0 }}
                  >
                    <Star size={22} filled={c.favorite} color={c.favorite ? "#FF6B35" : "rgba(255,255,255,0.92)"} />
                  </div>
                </div>

                {c.spotify && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 10,
                      background: "rgba(0,0,0,0.42)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 999,
                      padding: "4px 12px 4px 4px",
                      maxWidth: "100%",
                    }}
                  >
                    <SpotifyArt url={c.spotify.coverUrl} size={20} radius={5} />
                    <div style={{ fontSize: 11.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-inter), sans-serif", maxWidth: 220 }}>
                      {c.spotify.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Log Screen ───────────────────────────────────────────────────────────────

export function LogScreen({
  draft,
  step,
  spotifyQuery,
  spotifyResults,
  spotifyLoading,
  saving,
  saveError,
  onBack,
  onNext,
  onDraftChange,
  onSpotifyQuery,
  onPickSpotify,
  onClearSpotify,
  onTicketFile,
  onEnlargeTicket,
  onAddPhoto,
  onPhotoCaption,
  onRemovePhoto,
  onEnlargePhoto,
  onGenerateNote,
}: {
  draft: Draft;
  step: number;
  spotifyQuery: string;
  spotifyResults: SpotifyItem[];
  spotifyLoading: boolean;
  saving: boolean;
  saveError: string | null;
  onBack: () => void;
  onNext: () => void;
  onDraftChange: (patch: Partial<Draft>) => void;
  onSpotifyQuery: (q: string) => void;
  onPickSpotify: (item: SpotifyItem) => void;
  onClearSpotify: () => void;
  onTicketFile: (dataUrl: string) => void;
  onEnlargeTicket: () => void;
  onAddPhoto: (dataUrl: string) => void;
  onPhotoCaption: (index: number, caption: string) => void;
  onRemovePhoto: (index: number) => void;
  onEnlargePhoto: (index: number) => void;
  onGenerateNote: (tone: string) => Promise<string>;
}) {
  const stepDots = [1, 2, 3, 4].map((n) => ({
    color: n <= step ? "#FF6B35" : "rgba(242,236,224,0.25)",
  }));
  const stepIconName = STEP_ICON_NAMES[step - 1];

  const [noteMode, setNoteMode] = useState<"write" | "ai">("write");
  const [tone, setTone] = useState("chill");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Venue typeahead: debounced Nominatim search that suggests "place, city"
  // completions as the user types (e.g. "waterloo" → "Waterloo, Ontario").
  const [venueSuggestions, setVenueSuggestions] = useState<{ value: string; sub: string }[]>([]);
  const [venueOpen, setVenueOpen] = useState(false);
  const [venueLoading, setVenueLoading] = useState(false);
  const venuePickedRef = useRef(false);

  useEffect(() => {
    // Skip the fetch that the effect would otherwise fire right after a pick
    // (selecting a suggestion writes back into draft.venue).
    if (venuePickedRef.current) {
      venuePickedRef.current = false;
      return;
    }
    if (!venueOpen) return;
    const q = draft.venue.trim();
    if (q.length < 2) {
      setVenueSuggestions([]);
      setVenueLoading(false);
      return;
    }
    setVenueLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`,
          { headers: { Accept: "application/json" }, signal: controller.signal }
        );
        if (!res.ok) throw new Error("nominatim");
        const data = (await res.json()) as {
          name?: string;
          display_name: string;
          address?: Record<string, string>;
        }[];
        const seen = new Set<string>();
        const suggestions: { value: string; sub: string }[] = [];
        for (const item of data) {
          const a = item.address ?? {};
          const settlement =
            a.city || a.town || a.village || a.hamlet || a.municipality || a.suburb || a.county || "";
          const region = a.state || a.province || a.region || "";
          const country = a.country || "";
          const name = item.name || item.display_name.split(",")[0].trim();
          // "venue, city" — keep the trailing segment a real place so the
          // profile map's cityFromVenue() can still geocode it.
          let value: string;
          if (name && settlement && name !== settlement) {
            value = `${name}, ${settlement}`;
          } else {
            value = [settlement || name, region || country].filter(Boolean).join(", ");
          }
          if (!value || seen.has(value.toLowerCase())) continue;
          seen.add(value.toLowerCase());
          const sub = [region, country].filter((c) => c && !value.includes(c)).join(", ");
          suggestions.push({ value, sub });
        }
        setVenueSuggestions(suggestions);
      } catch {
        /* aborted or network error — leave the last suggestions in place */
      } finally {
        setVenueLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [draft.venue, venueOpen]);

  async function runGenerate() {
    setGenerating(true);
    setGenError(null);
    try {
      const text = await onGenerateNote(tone);
      onDraftChange({ comment: text });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "couldn't generate");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 16px 4px" }}>
        <div
          onClick={onBack}
          className="r-pressable"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F2ECE0",
            cursor: "pointer",
            background: "rgba(242,236,224,0.08)",
          }}
        >
          <IconChevronLeft size={20} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 7,
              background: "rgba(255,107,53,0)",
              color: "#FF6B35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MaterialIcon name={stepIconName} size={30} fill={1} />
          </div>
          <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 24, color: "#F2ECE0" }}>
            {STEP_TITLES[step - 1]}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {stepDots.map((d, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: d.color, transition: "background .25s ease" }} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ padding: "24px 22px 150px" }}>

        {/* Step 1: Basics */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="text"
              value={draft.artist}
              onChange={(e) => onDraftChange({ artist: e.target.value })}
              placeholder="artist / act"
              className="r-input"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(242,236,224,0.22)",
                color: "#F2ECE0",
                fontFamily: "var(--font-noto-serif-jp), serif",
                fontWeight: 600,
                fontSize: 24,
                padding: "10px 2px",
                width: "100%",
                outline: "none",
                marginBottom: 18,
              }}
            />
            <input
              type="text"
              value={draft.showName}
              onChange={(e) => onDraftChange({ showName: e.target.value })}
              placeholder="tour / event name (optional)"
              className="r-input"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(242,236,224,0.22)",
                color: "#F2ECE0",
                fontSize: 15,
                padding: "10px 2px",
                width: "100%",
                outline: "none",
                marginBottom: 18,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
            <div style={{ position: "relative", marginBottom: 18 }}>
              <input
                type="text"
                value={draft.venue}
                onChange={(e) => onDraftChange({ venue: e.target.value })}
                onFocus={() => setVenueOpen(true)}
                onBlur={() => setTimeout(() => setVenueOpen(false), 150)}
                placeholder="venue, city"
                autoComplete="off"
                className="r-input"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(242,236,224,0.22)",
                  color: "#F2ECE0",
                  fontSize: 15,
                  padding: "10px 2px",
                  width: "100%",
                  outline: "none",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
              {venueOpen && draft.venue.trim().length >= 2 && (venueLoading || venueSuggestions.length > 0) && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    zIndex: 5,
                    background: "#F2ECE0",
                    border: "1px solid rgba(15,94,94,0.2)",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
                  }}
                >
                  {venueLoading && venueSuggestions.length === 0 && (
                    <div style={{ fontSize: 12.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", padding: "10px 12px" }}>
                      searching…
                    </div>
                  )}
                  {venueSuggestions.map((s, i) => (
                    <div
                      key={s.value}
                      // onMouseDown fires before the input's onBlur, so the pick registers.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        venuePickedRef.current = true;
                        onDraftChange({ venue: s.value });
                        setVenueOpen(false);
                        setVenueSuggestions([]);
                      }}
                      className="r-pressable"
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderTop: i === 0 ? undefined : "1px solid rgba(15,94,94,0.1)",
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#1a1816", fontFamily: "var(--font-inter), sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.value}
                      </span>
                      {s.sub && (
                        <span style={{ fontSize: 11.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", whiteSpace: "nowrap" }}>
                          {s.sub}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => onDraftChange({ date: e.target.value })}
              className="r-input"
              style={{
                background: "transparent",
                colorScheme: "dark",
                border: "none",
                borderBottom: "1px solid rgba(242,236,224,0.22)",
                color: "#F2ECE0",
                fontSize: 15,
                padding: "10px 2px",
                width: "100%",
                outline: "none",
                marginBottom: 28,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,236,224,0.6)", marginBottom: 10, fontFamily: "var(--font-inter), sans-serif" }}>
              ticket stub
            </div>
            {draft.ticketUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.ticketUrl}
                  alt={draft.ticketCaption || "ticket stub"}
                  onClick={onEnlargeTicket}
                  style={{ width: "100%", height: "auto", borderRadius: 16, display: "block", cursor: "pointer" }}
                />
                <input
                  value={draft.ticketCaption}
                  onChange={(e) => onDraftChange({ ticketCaption: e.target.value })}
                  placeholder="add a caption for the ticket…"
                  maxLength={140}
                  className="r-input"
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "rgba(242,236,224,0.06)",
                    border: "1px solid rgba(242,236,224,0.18)",
                    borderRadius: 10,
                    color: "#F2ECE0",
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    fontStyle: "italic",
                    fontSize: 13.5,
                    padding: "9px 12px",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <FilePicker
                onFile={onTicketFile}
                style={{
                  width: "100%",
                  height: 170,
                  borderRadius: 16,
                  border: "1px dashed rgba(242,236,224,0.2)",
                  background: "rgba(242,236,224,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "rgba(242,236,224,0.45)",
                }}
              >
                <IconCamera size={20} />
                <span style={{ fontSize: 12, fontFamily: "var(--font-inter), sans-serif" }}>drop ticket photo</span>
              </FilePicker>
            )}
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,236,224,0.6)", marginBottom: 14, fontFamily: "var(--font-inter), sans-serif" }}>
              add up to 10 photos — caption each one
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {draft.photos.map((p, i) => (
                <div key={i}>
                  <div style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.dataUrl}
                      alt={p.caption || `photo ${i + 1}`}
                      onClick={() => onEnlargePhoto(i)}
                      style={{ width: "100%", height: "auto", borderRadius: 14, display: "block", cursor: "pointer" }}
                    />
                    <div
                      onClick={() => onRemovePhoto(i)}
                      className="r-pressable"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "rgba(4,16,16,0.6)",
                        color: "#F2ECE0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <IconClose size={16} />
                    </div>
                  </div>
                  <input
                    value={p.caption}
                    onChange={(e) => onPhotoCaption(i, e.target.value)}
                    placeholder="what was this moment?"
                    maxLength={140}
                    className="r-input"
                    style={{
                      width: "100%",
                      marginTop: 8,
                      background: "rgba(242,236,224,0.06)",
                      border: "1px solid rgba(242,236,224,0.18)",
                      borderRadius: 10,
                      color: "#F2ECE0",
                      fontFamily: "var(--font-noto-serif-jp), serif",
                      fontStyle: "italic",
                      fontSize: 13.5,
                      padding: "9px 12px",
                      outline: "none",
                    }}
                  />
                </div>
              ))}

              {draft.photos.length < 10 && (
                <FilePicker
                  onFile={onAddPhoto}
                  style={{
                    width: "100%",
                    height: 96,
                    borderRadius: 14,
                    border: "1px dashed rgba(242,236,224,0.25)",
                    background: "rgba(242,236,224,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "rgba(242,236,224,0.5)",
                  }}
                >
                  <IconCamera size={20} />
                  <span style={{ fontSize: 12.5, fontFamily: "var(--font-inter), sans-serif" }}>
                    add a photo{draft.photos.length > 0 ? ` (${draft.photos.length}/10)` : ""}
                  </span>
                </FilePicker>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Soundtrack */}
        {step === 3 && (
          <div>
            {draft.spotify && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(214,51,108,0.16)",
                  border: "1px solid rgba(214,51,108,0.45)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  marginBottom: 16,
                }}
              >
                <SpotifyArt url={draft.spotify.coverUrl} size={34} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#F2ECE0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {draft.spotify.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(242,236,224,0.6)", fontFamily: "var(--font-inter), sans-serif" }}>
                    {draft.spotify.type} · {draft.spotify.artist}
                  </div>
                </div>
                <div onClick={onClearSpotify} className="r-pressable" style={{ fontSize: 13, color: "rgba(242,236,224,0.6)", cursor: "pointer", padding: 6, fontFamily: "var(--font-inter), sans-serif" }}>
                  clear
                </div>
              </div>
            )}
            <input
              type="text"
              value={spotifyQuery}
              onChange={(e) => onSpotifyQuery(e.target.value)}
              placeholder="search artist, album, playlist — or paste a link"
              className="r-input"
              style={{
                background: "#E6DEC9",
                border: "1px solid rgba(15,94,94,0.16)",
                borderRadius: 999,
                color: "#1a1816",
                fontSize: 14,
                padding: "13px 18px",
                width: "100%",
                outline: "none",
                marginBottom: 14,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {spotifyQuery.trim() === "" && (
                <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.5)", fontFamily: "var(--font-inter), sans-serif", padding: "8px 2px", lineHeight: 1.5 }}>
                  search by artist to pull their albums, look up a playlist, or paste a Spotify album/playlist link.
                </div>
              )}
              {spotifyQuery.trim() !== "" && spotifyLoading && spotifyResults.length === 0 && (
                <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.5)", fontFamily: "var(--font-inter), sans-serif", padding: "8px 2px" }}>
                  searching…
                </div>
              )}
              {spotifyQuery.trim() !== "" && !spotifyLoading && spotifyResults.length === 0 && (
                <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.5)", fontFamily: "var(--font-inter), sans-serif", padding: "8px 2px" }}>
                  no matches for &ldquo;{spotifyQuery.trim()}&rdquo;
                </div>
              )}
              {spotifyResults.map((r) => {
                const isSel = draft.spotify?.id === r.id && draft.spotify?.type === r.type;
                return (
                  <div
                    key={`${r.type}-${r.id}`}
                    onClick={() => onPickSpotify(r)}
                    className="r-pressable"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 10,
                      borderRadius: 12,
                      background: isSel ? "rgba(214,51,108,0.16)" : "#F2ECE0",
                      border: `1px solid ${isSel ? "rgba(214,51,108,0.5)" : "rgba(15,94,94,0.16)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <SpotifyArt url={r.coverUrl} size={40} radius={9} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14.5, color: "#1a1816", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif" }}>
                        {r.type} · {r.artist}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Comment + review */}
        {step === 4 && (
          <div>
            {/* write vs. AI toggle */}
            <div style={{ display: "flex", gap: 4, background: "rgba(242,236,224,0.08)", borderRadius: 999, padding: 4, marginBottom: 16 }}>
              {(["write", "ai"] as const).map((m) => (
                <div
                  key={m}
                  onClick={() => setNoteMode(m)}
                  className="r-pressable"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "9px 0",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    background: noteMode === m ? "#F2ECE0" : "transparent",
                    color: noteMode === m ? "#1a1816" : "rgba(242,236,224,0.6)",
                  }}
                >
                  {m === "write" ? "write it myself" : "let ai draft it"}
                </div>
              ))}
            </div>

            {noteMode === "ai" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,236,224,0.6)", marginBottom: 10, fontFamily: "var(--font-inter), sans-serif" }}>
                  pick a tone
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {TONES.map((t) => {
                    const active = tone === t;
                    return (
                      <div
                        key={t}
                        onClick={() => setTone(t)}
                        className="r-pressable"
                        style={{
                          padding: "7px 14px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--font-inter), sans-serif",
                          background: active ? "#FF6B35" : "rgba(242,236,224,0.1)",
                          color: active ? "#F2ECE0" : "rgba(242,236,224,0.75)",
                          border: `1px solid ${active ? "transparent" : "rgba(242,236,224,0.18)"}`,
                        }}
                      >
                        {t}
                      </div>
                    );
                  })}
                </div>
                <div
                  onClick={generating ? undefined : runGenerate}
                  className="r-pressable"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,107,53,0.16)",
                    border: "1px solid rgba(255,107,53,0.5)",
                    color: "#FF6B35",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: generating ? "default" : "pointer",
                    opacity: generating ? 0.7 : 1,
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {generating ? "generating…" : draft.comment.trim() ? "regenerate" : "generate from my captions"}
                </div>
                {genError && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#FF6B35", fontFamily: "var(--font-inter), sans-serif" }}>{genError}</div>
                )}
              </div>
            )}

            <textarea
              rows={5}
              value={draft.comment}
              onChange={(e) => onDraftChange({ comment: e.target.value })}
              placeholder={noteMode === "ai" ? "your generated note will appear here — edit freely" : "write it down before it fades..."}
              className="r-input"
              style={{
                width: "100%",
                background: "#F2ECE0",
                border: "1px solid rgba(15,94,94,0.16)",
                borderRadius: 14,
                color: "#1a1816",
                fontFamily: "var(--font-noto-serif-jp), serif",
                fontSize: 15.5,
                lineHeight: 1.6,
                padding: 14,
                outline: "none",
                resize: "none",
                marginBottom: 22,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "#F2ECE0",
                border: "1px solid rgba(15,94,94,0.16)",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 600, fontSize: 17, color: "#1a1816" }}>
                {draft.showName.trim() || draft.artist.trim() || "untitled show"}
              </div>
              {draft.showName.trim() && (
                <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 13.5, color: "#0F5E5E", marginTop: -4 }}>
                  {draft.artist.trim() || "artist tbd"}
                </div>
              )}
              <div style={{ fontSize: 12.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif" }}>
                {(draft.venue.trim() || "venue tbd") + " · " + (draft.date ? prettyDate(draft.date) : "date tbd")}
              </div>
              {draft.spotify && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <SpotifyArt url={draft.spotify.coverUrl} size={18} radius={4} />
                  <div style={{ fontSize: 12, color: "#1a1816", fontFamily: "var(--font-inter), sans-serif" }}>{draft.spotify.name}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, #0F5E5E 60%, transparent)",
          padding: "26px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
        }}
      >
        {saveError && (
          <div style={{ flex: 1, fontSize: 12, color: "#FF6B35", fontFamily: "var(--font-inter), sans-serif" }}>{saveError}</div>
        )}
        <div
          onClick={saving ? undefined : onNext}
          className="r-pressable"
          style={{
            background: "#FF6B35",
            color: "#F2ECE0",
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.02em",
            padding: "15px 30px",
            borderRadius: 999,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
            userSelect: "none",
            boxShadow: "0 3px 8px rgba(255,107,53,0.22)",
          }}
        >
          {step >= 4 ? (saving ? "saving…" : "log it") : "next"}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Screen ─────────────────────────────────────────────────────────────

export function DetailScreen({
  concert,
  onBack,
  onToggleFavorite,
  onEnlarge,
}: {
  concert: Concert;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onEnlarge: (url: string, caption: string) => void;
}) {
  const photoCount = concert.photos.length;

  return (
    <div style={{ minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 16px 0" }}>
        <div
          onClick={onBack}
          className="r-pressable"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F2ECE0",
            cursor: "pointer",
            background: "rgba(242,236,224,0.08)",
          }}
        >
          <IconChevronLeft size={20} />
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>
          concert pass
        </div>
        <div
          onClick={() => onToggleFavorite(concert.id)}
          className="r-pressable"
          style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#F2ECE0" }}
        >
          <Star size={20} filled={concert.favorite} />
        </div>
      </div>

      <div style={{ padding: "8px 22px 60px" }}>
        {concert.ticketUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={concert.ticketUrl}
            alt={concert.ticketCaption || "ticket stub"}
            onClick={() => onEnlarge(concert.ticketUrl!, concert.ticketCaption)}
            style={{ width: "100%", height: "auto", borderRadius: 18, display: "block", cursor: "pointer" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 190,
              borderRadius: 18,
              border: "1px dashed rgba(242,236,224,0.2)",
              background: "rgba(242,236,224,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "rgba(242,236,224,0.45)",
            }}
          >
            <IconTicket size={20} />
            <span style={{ fontSize: 12, fontFamily: "var(--font-inter), sans-serif" }}>no ticket</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 22 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 27, color: "#F2ECE0", lineHeight: 1.1 }}>
              {concert.showName || concert.artist}
            </div>
            {concert.showName && (
              <div style={{ fontSize: 15, color: "rgba(242,236,224,0.82)", marginTop: 6, fontFamily: "var(--font-noto-serif-jp), serif" }}>
                {concert.artist}
              </div>
            )}
            <div style={{ fontSize: 13, color: "rgba(242,236,224,0.6)", marginTop: 6, fontFamily: "var(--font-inter), sans-serif" }}>
              {(concert.venue || "venue tbd") + " · " + prettyDate(concert.date)}
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FF6B35",
              border: "1px solid rgba(255,107,53,0.5)",
              borderRadius: 999,
              padding: "5px 10px",
              transform: "rotate(3deg)",
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700,
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            stamped
          </div>
        </div>

        {/* Boarding-pass style stat strip */}
        <div style={{ background: "#F2ECE0", border: "1px solid rgba(15,94,94,0.16)", borderRadius: 18, marginTop: 20, overflow: "hidden" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginBottom: 4 }}>
                soundtrack
              </div>
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14.5, color: "#1a1816", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {concert.spotify ? concert.spotify.name : "not linked"}
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(15,94,94,0.16)" }} />
            <div style={{ flex: 1, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginBottom: 4 }}>
                memories
              </div>
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14.5, color: "#1a1816" }}>
                {photoCount} photo{photoCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div
            style={{
              height: 18,
              backgroundImage: "repeating-linear-gradient(90deg, rgba(26,24,22,0.55) 0 2px, transparent 2px 5px)",
              opacity: 0.5,
              margin: "0 16px 14px",
            }}
          />
        </div>

        {concert.spotify && (
          <a
            href={concert.spotify.externalUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="r-pressable"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#F2ECE0",
              border: "1px solid rgba(15,94,94,0.16)",
              borderRadius: 16,
              padding: 14,
              marginTop: 14,
              textDecoration: "none",
              cursor: concert.spotify.externalUrl ? "pointer" : "default",
            }}
          >
            <SpotifyArt url={concert.spotify.coverUrl} size={52} radius={11} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 15.5, color: "#1a1816", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {concert.spotify.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif" }}>
                {concert.spotify.type} · {concert.spotify.artist}
              </div>
            </div>
            {concert.spotify.externalUrl && <IconChevronRight size={16} />}
          </a>
        )}

        {concert.photos.length > 0 && (
          <>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,236,224,0.6)", marginTop: 26, marginBottom: 12, fontFamily: "var(--font-inter), sans-serif" }}>
              photos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {concert.photos.map((p, i) => (
                <div key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption || `photo ${i + 1}`}
                    onClick={() => onEnlarge(p.url, p.caption)}
                    style={{ width: "100%", height: "auto", borderRadius: 14, display: "block", cursor: "pointer" }}
                  />
                  {p.caption && (
                    <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.7)", fontFamily: "var(--font-noto-serif-jp), serif", fontStyle: "italic", marginTop: 8 }}>
                      {p.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {concert.comment && (
          <div style={{ marginTop: 28, background: "rgba(242,236,224,0.06)", border: "1px dashed rgba(242,236,224,0.25)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4E157", fontFamily: "var(--font-inter), sans-serif", marginBottom: 8 }}>
              the memory
            </div>
            <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontStyle: "italic", fontSize: 16.5, lineHeight: 1.65, color: "#F2ECE0" }}>
              {concert.comment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile Screen ─────────────────────────────────────────────────────────────

export interface ImportMeta {
  artist: string;
  venue: string;
  date: string;
  comment: string;
  favorite: boolean;
}

export function ProfileScreen({
  concerts,
  profile,
  onOpenConcert,
  onImport,
  onReset,
  onSignOut,
  onRename,
  onSetGoal,
}: {
  concerts: Concert[];
  profile: UserProfile;
  onOpenConcert: (id: string) => void;
  onImport: (items: ImportMeta[]) => void;
  onReset: () => void;
  onSignOut: () => void;
  onRename: (name: string) => void;
  onSetGoal: (goal: number | null) => void;
}) {
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [statSheet, setStatSheet] = useState<null | "shows" | "artists" | "cities" | "photos" | "favorites" | "top">(null);
  const [goalInput, setGoalInput] = useState(profile.goal ? String(profile.goal) : "");

  useEffect(() => {
    setGoalInput(profile.goal ? String(profile.goal) : "");
  }, [profile.goal]);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(profile.name);
  }, [profile.name]);

  function saveName() {
    setEditingName(false);
    if (nameInput.trim() !== profile.name) onRename(nameInput.trim());
  }

  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  const totalShows = concerts.length;
  const favoriteCount = concerts.filter((c) => c.favorite).length;
  const photoCount = concerts.reduce((sum, c) => sum + c.photos.length, 0);

  const artistCounts = new Map<string, number>();
  concerts.forEach((c) => artistCounts.set(c.artist, (artistCounts.get(c.artist) ?? 0) + 1));
  const topArtist = Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;

  const uniqueArtists = new Set(concerts.map((c) => c.artist)).size;
  const uniqueCities = new Set(concerts.map((c) => cityFromVenue(c.venue))).size;
  const autoGoal = Math.max(5, Math.ceil((totalShows + 1) / 5) * 5);
  // Personal target if the user set one, otherwise the rolling auto milestone.
  const showsGoal = profile.goal ?? autoGoal;

  function handleExport() {
    const payload = concerts.map((c) => ({
      artist: c.artist,
      venue: c.venue,
      date: c.date,
      comment: c.comment,
      favorite: c.favorite,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resonare-concerts.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    importInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("bad shape");
        const items: ImportMeta[] = parsed.map((c) => {
          if (typeof c?.artist !== "string") throw new Error("bad shape");
          return {
            artist: c.artist,
            venue: typeof c.venue === "string" ? c.venue : "",
            date: typeof c.date === "string" ? c.date : "",
            comment: typeof c.comment === "string" ? c.comment : "",
            favorite: Boolean(c.favorite),
          };
        });
        onImport(items);
      } catch {
        setImportError("couldn't read that file — expected a resonare export");
      }
    };
    reader.readAsText(file);
  }

  function handleResetClick() {
    if (confirmReset) {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
      setConfirmReset(false);
      onReset();
    } else {
      setConfirmReset(true);
      resetTimeout.current = setTimeout(() => setConfirmReset(false), 4000);
    }
  }

  const dataButton: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
    padding: "11px 8px",
    borderRadius: 999,
    background: "rgba(242,236,224,0.1)",
    border: "1px solid rgba(242,236,224,0.18)",
    color: "#F2ECE0",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-inter), sans-serif",
  };

  return (
    <div style={{ minHeight: "100%" }}>
      <br />
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "26px 22px 18px" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            background: "#FF6B35",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#F2ECE0",
          }}
        >
          <MaterialIcon name="account_circle" size={39} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") {
                  setNameInput(profile.name);
                  setEditingName(false);
                }
              }}
              placeholder="your name"
              maxLength={40}
              className="r-input"
              style={{
                width: "100%",
                background: "rgba(242,236,224,0.08)",
                border: "1px solid rgba(242,236,224,0.2)",
                borderRadius: 10,
                color: "#F2ECE0",
                fontFamily: "var(--font-noto-serif-jp), serif",
                fontWeight: 700,
                fontSize: 19,
                padding: "6px 10px",
                outline: "none",
              }}
            />
          ) : (
            <div
              onClick={() => setEditingName(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 800, fontSize: 25, color: "#F2ECE0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.name || "add your name"}
              </div>
              <span style={{ color: "rgba(242,236,224,0.5)", display: "flex", flexShrink: 0 }}>
                <IconPen size={13} />
              </span>
            </div>
          )}
          <div style={{ fontSize: 11.5, color: "rgba(242,236,224,0.6)", fontFamily: "var(--font-inter), sans-serif", marginTop: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.email || "every show, kept somewhere safe"}
          </div>
        </div>
        <div
          onClick={onSignOut}
          className="r-pressable"
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "rgba(242,236,224,0.7)",
            border: "1px solid rgba(242,236,224,0.18)",
            borderRadius: 999,
            padding: "7px 12px",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
            flexShrink: 0,
          }}
        >
          sign out
        </div>
      </div>

      <div style={{ padding: "0 20px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Favorited ring card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#F2ECE0",
            border: "1px solid rgba(15,94,94,0.16)",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 10px 24px rgba(4,30,30,0.28)",
          }}
        >
          <StatRing value={favoriteCount} max={Math.max(totalShows, 1)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 16.5, color: "#1a1816", lineHeight: 1.25 }}>
              {favoriteCount} of {totalShows} shows favorited
            </div>
            <div style={{ fontSize: 12, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginTop: 4 }}>
              {photoCount} photo{photoCount === 1 ? "" : "s"} captured across every stamp
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div style={{ display: "flex", gap: 8 }}>
          <MiniStat label="shows" value={totalShows} sub={`${profile.goal ? "goal" : "next goal"} ${showsGoal}`} progress={showsGoal > 0 ? totalShows / showsGoal : 0} onClick={() => setStatSheet("shows")} />
          <MiniStat label="artists" value={uniqueArtists} sub="unique acts" onClick={() => setStatSheet("artists")} />
          <MiniStat label="cities" value={uniqueCities} sub="explored" onClick={() => setStatSheet("cities")} />
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 8 }}>
          <MiniStat label="photos" value={photoCount} sub="captured" onClick={() => setStatSheet("photos")} />
          <MiniStat label="favorites" value={favoriteCount} sub="starred shows" onClick={() => setStatSheet("favorites")} />
          <MiniStat label="top artist" value={topArtist ? topArtist[0] : "—"} sub={topArtist ? `${topArtist[1]} show${topArtist[1] === 1 ? "" : "s"}` : "log a show"} onClick={topArtist ? () => setStatSheet("top") : undefined} />
        </div>
      </div>

      {/* Map of cities */}
      {concerts.length > 0 && (
        <div style={{ padding: "10px 20px 0" }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif", marginBottom: 10 }}>
            your map · {uniqueCities} cit{uniqueCities === 1 ? "y" : "ies"}
          </div>
          <ConcertMap
            concerts={concerts.map((c) => ({
              id: c.id,
              artist: c.artist,
              showName: c.showName,
              venue: c.venue,
              date: c.date,
            }))}
          />
        </div>
      )}

      {/* Stamps grid */}
      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif", marginBottom: 10 }}>
          your stamps
        </div>
        {concerts.length === 0 ? (
          <div style={{ padding: "30px 10px", textAlign: "center", color: "rgba(242,236,224,0.5)", fontFamily: "var(--font-inter), sans-serif", fontSize: 13 }}>
            no shows stamped yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {concerts.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenConcert(c.id)}
                className="r-pressable"
                style={{
                  background: "#F2ECE0",
                  border: "1px dashed rgba(15,94,94,0.3)",
                  borderRadius: 14,
                  padding: "12px 12px 14px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {c.favorite && (
                  <div style={{ position: "absolute", top: 8, right: 8 }}>
                    <Star size={15} filled />
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "#1a1816",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: c.favorite ? 16 : 0,
                  }}
                >
                  {c.artist}
                </div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "#0F5E5E", fontFamily: "var(--font-inter), sans-serif", marginTop: 4 }}>
                  {cityFromVenue(c.venue) || "—"}
                </div>
                <div style={{ fontSize: 10.5, color: "#8f8a85", fontFamily: "var(--font-inter), sans-serif", marginTop: 2 }}>
                  {prettyDate(c.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data actions */}
      <div style={{ padding: "22px 20px 120px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", fontFamily: "var(--font-inter), sans-serif", marginBottom: 10 }}>
          your data
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div onClick={handleExport} className="r-pressable" style={dataButton}>
            export
          </div>
          <div onClick={handleImportClick} className="r-pressable" style={dataButton}>
            import
            <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportFile} />
          </div>
          <div
            onClick={handleResetClick}
            className="r-pressable"
            style={{
              ...dataButton,
              background: confirmReset ? "rgba(255,107,53,0.18)" : "rgba(242,236,224,0.1)",
              border: `1px solid ${confirmReset ? "rgba(255,107,53,0.5)" : "rgba(242,236,224,0.18)"}`,
              color: confirmReset ? "#FF6B35" : "#F2ECE0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {confirmReset ? "tap to confirm" : "reset"}
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "rgba(242,236,224,0.4)", fontFamily: "var(--font-inter), sans-serif" }}>
          import restores show details (artist, venue, date, notes) — photos and Spotify links aren&rsquo;t included in an export.
        </div>
        {importError && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#FF6B35", fontFamily: "var(--font-inter), sans-serif" }}>{importError}</div>
        )}
      </div>

      {statSheet &&
        (() => {
          const rowStyle: React.CSSProperties = {
            padding: "11px 4px",
            borderBottom: "1px solid rgba(242,236,224,0.08)",
            fontFamily: "var(--font-inter), sans-serif",
          };
          const concertRow = (c: Concert) => (
            <div
              key={c.id}
              onClick={() => {
                setStatSheet(null);
                onOpenConcert(c.id);
              }}
              className="r-pressable"
              style={{ ...rowStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "#F2ECE0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.artist}
                  {c.showName ? <span style={{ fontStyle: "italic", color: "rgba(242,236,224,0.6)", fontWeight: 400 }}> · {c.showName}</span> : null}
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(242,236,224,0.5)", marginTop: 2 }}>
                  {[cityFromVenue(c.venue), prettyDate(c.date)].filter(Boolean).join(" · ")}
                </div>
              </div>
              {c.favorite && <Star size={14} filled color="#FF6B35" />}
              <IconChevronRight size={14} />
            </div>
          );
          const countRow = (label: string, count: number) => (
            <div key={label} style={{ ...rowStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, color: "#F2ECE0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
              <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.55)", flexShrink: 0, marginLeft: 10 }}>
                {count} show{count === 1 ? "" : "s"}
              </div>
            </div>
          );

          let title = "";
          let body: React.ReactNode = null;

          if (statSheet === "shows") {
            title = "your shows";
            const parsed = parseInt(goalInput, 10);
            const nextGoal = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            body = (
              <>
                <div style={{ background: "rgba(242,236,224,0.06)", border: "1px solid rgba(242,236,224,0.14)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(242,236,224,0.55)", marginBottom: 8, fontFamily: "var(--font-inter), sans-serif" }}>
                    your goal
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      min={1}
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder={String(autoGoal)}
                      className="r-input"
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "1px solid rgba(242,236,224,0.22)", borderRadius: 10, color: "#F2ECE0", fontSize: 15, padding: "9px 12px", outline: "none", fontFamily: "var(--font-inter), sans-serif" }}
                    />
                    <div
                      onClick={() => onSetGoal(nextGoal)}
                      className="r-pressable"
                      style={{ background: "#FF6B35", color: "#F2ECE0", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-inter), sans-serif", flexShrink: 0 }}
                    >
                      save
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(242,236,224,0.45)", marginTop: 8, fontFamily: "var(--font-inter), sans-serif" }}>
                    {profile.goal ? (
                      <span onClick={() => onSetGoal(null)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                        clear goal — use auto ({autoGoal})
                      </span>
                    ) : (
                      `auto goal is ${autoGoal} — set your own target above`
                    )}
                  </div>
                </div>
                {concerts.length ? concerts.map(concertRow) : <div style={{ ...rowStyle, color: "rgba(242,236,224,0.5)" }}>no shows yet</div>}
              </>
            );
          } else if (statSheet === "artists") {
            title = "artists";
            const rows = Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1]);
            body = rows.map(([name, n]) => countRow(name, n));
          } else if (statSheet === "cities") {
            title = "cities";
            const cityCounts = new Map<string, number>();
            concerts.forEach((c) => {
              const city = cityFromVenue(c.venue) || "—";
              cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
            });
            const rows = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]);
            body = rows.map(([name, n]) => countRow(name, n));
          } else if (statSheet === "photos") {
            title = "photos";
            const withPhotos = concerts.filter((c) => c.photos.length > 0);
            body = withPhotos.length
              ? withPhotos.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setStatSheet(null);
                      onOpenConcert(c.id);
                    }}
                    className="r-pressable"
                    style={{ ...rowStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
                  >
                    <div style={{ fontSize: 14, color: "#F2ECE0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.artist}</div>
                    <div style={{ fontSize: 12.5, color: "rgba(242,236,224,0.55)", flexShrink: 0 }}>
                      {c.photos.length} photo{c.photos.length === 1 ? "" : "s"}
                    </div>
                  </div>
                ))
              : <div style={{ ...rowStyle, color: "rgba(242,236,224,0.5)" }}>no photos yet</div>;
          } else if (statSheet === "favorites") {
            title = "favorites";
            const favs = concerts.filter((c) => c.favorite);
            body = favs.length ? favs.map(concertRow) : <div style={{ ...rowStyle, color: "rgba(242,236,224,0.5)" }}>no favorites yet</div>;
          } else if (statSheet === "top") {
            title = topArtist ? topArtist[0] : "top artist";
            const theirs = topArtist ? concerts.filter((c) => c.artist === topArtist[0]) : [];
            body = theirs.map(concertRow);
          }

          return (
            <div
              onClick={() => setStatSheet(null)}
              style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(4,16,16,0.72)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 430,
                  maxHeight: "82%",
                  background: "#0b2b2b",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  border: "1px solid rgba(242,236,224,0.14)",
                  borderBottom: "none",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 19, color: "#F2ECE0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {title}
                  </div>
                  <div
                    onClick={() => setStatSheet(null)}
                    className="r-pressable"
                    style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(242,236,224,0.1)", color: "#F2ECE0", cursor: "pointer", flexShrink: 0 }}
                  >
                    <IconClose size={16} />
                  </div>
                </div>
                <div className="phone-scroll" style={{ overflowY: "auto", padding: "0 20px 28px" }}>{body}</div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export const EMPTY_DRAFT: Draft = { artist: "", showName: "", venue: "", date: "", spotify: null, comment: "", ticketUrl: null, ticketCaption: "", photos: [] };
