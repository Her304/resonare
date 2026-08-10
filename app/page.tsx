"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const serif = "var(--font-noto-serif-jp), serif";
const sans = "var(--font-inter), sans-serif";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const PAGE_BG =
  "radial-gradient(120% 70% at 50% 0%, #0F5E5E 0%, #082F2F 48%, #061f1f 100%)";

const FEATURES: { icon: string; title: string; body: string }[] = [
  {
    icon: "confirmation_number",
    title: "Stamp the ticket",
    body: "Snap your stub and name the artist and tour. Every entry starts with the ticket in your hand.",
  },
  {
    icon: "camera_roll",
    title: "Ten frames a night",
    body: "Add up to ten photos per show — the crowd, the lights, the blurry encore you'll want later.",
  },
  {
    icon: "art_track",
    title: "Pin the soundtrack",
    body: "Link the album or playlist from Spotify so the set plays back the moment you return.",
  },
  {
    icon: "stadium",
    title: "Map your cities",
    body: "Every venue drops a pin. Watch your personal tour map fill in, city by city.",
  },
  {
    icon: "edit_square",
    title: "Write it, or let AI",
    body: "Jot a reflection by hand, or let a gentle first draft appear from your photos and details.",
  },
  {
    icon: "star",
    title: "Chase the goal",
    body: "Set a shows-per-year goal and watch the ring close a little more with each night out.",
  },
];

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, fontVariationSettings: "'wght' 500, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

/* Fires once when the element scrolls into view — drives scroll reveals and count-ups. */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* Scroll-reveal wrapper. `className` picks the motion (reveal | magic-card). */
function Reveal({
  children,
  className = "reveal",
  delay = 0,
  style,
  id,
}: {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
  id?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      id={id}
      ref={ref}
      className={`${className}${inView ? " in" : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* motion-graphics "stat" count-up — eases 0 → target once `run` is true. */
function useCountUp(target: number, run: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

export default function LandingPage() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        overflow: "hidden",
        background: PAGE_BG,
        color: "#F2ECE0",
        fontFamily: sans,
      }}
    >
      <div className="r-grain" style={{ position: "fixed", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        {/* Top bar */}
        <header
          className="kin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 26,
            paddingBottom: 8,
          }}
        >
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px" }}>
            resonare
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link
              href="/login"
              className="r-pressable"
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "rgba(242,236,224,0.85)",
                textDecoration: "none",
                padding: "9px 14px",
                borderRadius: 999,
              }}
            >
              sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="r-pressable"
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "#F2ECE0",
                background: "#FF6B35",
                textDecoration: "none",
                padding: "9px 18px",
                borderRadius: 999,
                boxShadow: "0 10px 24px -12px rgba(255,107,53,0.9)",
              }}
            >
              sign up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section
          className="landing-hero"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            paddingTop: 48,
            paddingBottom: 72,
          }}
        >
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <div
              className="kin"
              style={{
                animationDelay: "60ms",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(242,236,224,0.55)",
              }}
            >
              your concert diary
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontWeight: 700,
                fontSize: "clamp(38px, 6vw, 58px)",
                lineHeight: 1.06,
                letterSpacing: "-1px",
                margin: "18px 0 0",
              }}
            >
              <span className="kin" style={{ display: "block", animationDelay: "150ms" }}>
                Every show you&rsquo;ve
              </span>
              <span className="kin" style={{ display: "block", animationDelay: "250ms" }}>
                ever felt, kept
              </span>
              <span className="kin" style={{ display: "block", animationDelay: "350ms" }}>
                in <span style={{ color: "#FF6B35" }}>one place.</span>
              </span>
            </h1>
            <p
              className="kin"
              style={{
                animationDelay: "500ms",
                fontSize: 17,
                lineHeight: 1.6,
                color: "rgba(242,236,224,0.72)",
                margin: "22px 0 0",
                maxWidth: 460,
              }}
            >
              Photograph the ticket, pin the soundtrack, map the cities, and write the night down.
              Resonare turns each concert into a page you&rsquo;ll actually revisit.
            </p>

            <div
              className="kin hero-cta"
              style={{
                animationDelay: "640ms",
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 32,
                alignItems: "center",
              }}
            >
              <Link
                href="/login?mode=signup"
                className="r-pressable"
                style={{
                  background: "#FF6B35",
                  color: "#F2ECE0",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "15px 28px",
                  borderRadius: 999,
                  boxShadow: "0 16px 34px -14px rgba(255,107,53,0.7)",
                }}
              >
                Start your diary
              </Link>
              <a
                href="#features"
                className="r-pressable"
                style={{
                  color: "rgba(242,236,224,0.85)",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "15px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(242,236,224,0.2)",
                }}
              >
                See what&rsquo;s inside
              </a>
            </div>
            <div
              className="kin"
              style={{ animationDelay: "760ms", marginTop: 18, fontSize: 12.5, color: "rgba(242,236,224,0.45)" }}
            >
              Free to start. Your diary stays private to you.
            </div>
          </div>

          {/* Phone mockup — reveals + count-ups when it enters view */}
          <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
            <PhoneMockup />
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ paddingBottom: 40, scrollMarginTop: 24 }}>
          <Reveal>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(242,236,224,0.5)",
                textAlign: "center",
              }}
            >
              one entry per night
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2
              style={{
                fontFamily: serif,
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 38px)",
                letterSpacing: "-0.5px",
                textAlign: "center",
                margin: "12px 0 0",
              }}
            >
              Everything from that show, together
            </h2>
          </Reveal>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Reveal
              className="accent-wipe"
              delay={140}
              style={{ width: 64, height: 3, borderRadius: 2, background: "#FF6B35", marginTop: 16 }}
            />
          </div>

          {/* Magic Move handoff: the same concert card from the phone relays down here */}
          <Reveal className="magic-card" style={{ maxWidth: 400, margin: "34px auto 0" }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.06em",
                color: "rgba(242,236,224,0.5)",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              one card holds the whole night
            </div>
            <ConcertCard height={158} radius={20} titleSize={21} />
          </Reveal>

          <div
            className="landing-features"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 44,
            }}
          >
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70} style={{ height: "100%" }}>
                <div
                  style={{
                    height: "100%",
                    background: "rgba(242,236,224,0.04)",
                    border: "1px solid rgba(242,236,224,0.1)",
                    borderRadius: 20,
                    padding: "26px 24px",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: "rgba(255,107,53,0.14)",
                      color: "#FF6B35",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={f.icon} size={24} />
                  </div>
                  <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 19, marginTop: 18 }}>
                    {f.title}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(242,236,224,0.65)", margin: "8px 0 0" }}>
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section style={{ padding: "64px 0 80px" }}>
          <Reveal>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(15,94,94,0.55), rgba(8,47,47,0.55))",
                border: "1px solid rgba(242,236,224,0.12)",
                borderRadius: 28,
                padding: "clamp(32px, 5vw, 56px)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: "clamp(26px, 4vw, 36px)",
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                Your next show deserves a page.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "rgba(242,236,224,0.7)",
                  margin: "14px auto 0",
                  maxWidth: 440,
                }}
              >
                Start with the last ticket in your pocket. It takes about a minute to log a night you&rsquo;ll
                keep forever.
              </p>
              <Link
                href="/login?mode=signup"
                className="r-pressable"
                style={{
                  display: "inline-block",
                  marginTop: 28,
                  background: "#FF6B35",
                  color: "#F2ECE0",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: 999,
                  boxShadow: "0 16px 34px -14px rgba(255,107,53,0.7)",
                }}
              >
                Start your diary
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(242,236,224,0.1)",
            padding: "24px 0 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16 }}>resonare</span>
            <span style={{ fontSize: 12.5, color: "rgba(242,236,224,0.45)" }}>your concert diary</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            {[
              { href: "/terms", label: "terms" },
              { href: "/privacy", label: "privacy" },
              { href: "/community-guidelines", label: "guidelines" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize: 12.5, color: "rgba(242,236,224,0.45)", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/login" style={{ fontSize: 13, color: "rgba(242,236,224,0.6)", textDecoration: "none" }}>
              sign in →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* The shared "Magic Move" element — the same concert card appears in the phone
   hero and, relayed, in the features section. */
function ConcertCard({ height, radius, titleSize }: { height: number; radius: number; titleSize: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0F5E5E, #082F2F)",
        border: "1px solid rgba(242,236,224,0.12)",
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 12, color: "#FF6B35" }}>
        <Icon name="star" size={20} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: titleSize, color: "#fff" }}>
          The Eras Tour
        </div>
        <div style={{ fontFamily: serif, fontSize: 11.5, color: "rgba(255,255,255,0.9)", marginTop: 1 }}>
          Taylor Swift
        </div>
        <div style={{ fontSize: 11, color: "#fff", marginTop: 3 }}>Toronto · Nov 21, 2024</div>
      </div>
    </div>
  );
}

/* A static, on-brand echo of the app's phone frame for the hero. */
function PhoneMockup() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const shows = useCountUp(12, inView);
  const cities = useCountUp(6, inView, 1000);
  const photos = useCountUp(48, inView, 1400);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " in" : ""}`}
      style={{
        width: 300,
        borderRadius: 40,
        background: "#0F5E5E",
        border: "1px solid rgba(242,236,224,0.14)",
        boxShadow: "0 40px 80px -30px rgba(2,16,16,0.9)",
        padding: 18,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "6px 4px 0" }}>
        <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: "#F2ECE0" }}>resonare</span>
        <span style={{ fontSize: 9.5, color: "rgba(242,236,224,0.55)", letterSpacing: "0.04em" }}>
          stamped in, played out
        </span>
      </div>

      {/* atlas card */}
      <div
        style={{
          marginTop: 16,
          background: "#F2ECE0",
          borderRadius: 20,
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 18px 36px -22px rgba(2,16,16,0.7)",
        }}
      >
        <Ring value={shows} inView={inView} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: "#1a1816" }}>
            {shows} of 15 shows logged
          </div>
          <div style={{ fontSize: 11.5, color: "#8f8a85", marginTop: 3 }}>
            9 artists · {cities} cities explored
          </div>
        </div>
      </div>

      {/* mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
        {[
          ["shows", shows],
          ["cities", cities],
          ["photos", photos],
        ].map(([label, value]) => (
          <div key={label as string} style={{ background: "#F2ECE0", borderRadius: 12, padding: "10px 10px 12px" }}>
            <div style={{ fontSize: 8.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8f8a85" }}>
              {label}
            </div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: "#1a1816", marginTop: 2 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* concert card (shared Magic Move element) */}
      <div style={{ marginTop: 12 }}>
        <ConcertCard height={132} radius={18} titleSize={17} />
      </div>
    </div>
  );
}

function Ring({ value, inView }: { value: number; inView: boolean }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = 0.8;
  return (
    <div style={{ position: "relative", width: 58, height: 58, flex: "0 0 auto" }}>
      <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="29" cy="29" r={r} fill="none" stroke="rgba(26,24,22,0.12)" strokeWidth="5" />
        <circle
          cx="29"
          cy="29"
          r={r}
          fill="none"
          stroke="#FF6B35"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c * (1 - pct) : c}
          style={{ transition: `stroke-dashoffset 1.2s ${EASE}` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 18,
          color: "#1a1816",
        }}
      >
        {value}
      </div>
    </div>
  );
}
