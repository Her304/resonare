"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #0F5E5E 0%, #082F2F 55%, #061f1f 100%)" }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            fontFamily: "var(--font-noto-serif-jp), serif",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "-0.5px",
            color: "#F2ECE0",
            textAlign: "center",
          }}
        >
          resonare
        </div>
        <div
          style={{
            fontSize: 12.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(242,236,224,0.55)",
            textAlign: "center",
            marginTop: 8,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          your concert diary
        </div>

        <div
          style={{
            marginTop: 32,
            background: "#F2ECE0",
            border: "1px solid rgba(15,94,94,0.16)",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 24px 60px -20px rgba(2,16,16,0.6)",
          }}
        >
          {status === "sent" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontWeight: 700, fontSize: 19, color: "#1a1816" }}>
                check your inbox
              </div>
              <div style={{ fontSize: 13.5, color: "#8f8a85", marginTop: 8, lineHeight: 1.55, fontFamily: "var(--font-inter), sans-serif" }}>
                We sent a sign-in link to <strong style={{ color: "#1a1816" }}>{email.trim()}</strong>. Open it on this
                device to continue.
              </div>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  marginTop: 18,
                  background: "transparent",
                  border: "none",
                  color: "#FF6B35",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={sendLink}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8f8a85",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="r-input"
                style={{
                  width: "100%",
                  marginTop: 8,
                  background: "#fff",
                  border: "1px solid rgba(15,94,94,0.2)",
                  borderRadius: 12,
                  color: "#1a1816",
                  fontSize: 15,
                  padding: "13px 14px",
                  outline: "none",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />

              {status === "error" && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: "#c0392b", fontFamily: "var(--font-inter), sans-serif" }}>
                  {message || "Couldn't send the link. Try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="r-pressable"
                style={{
                  width: "100%",
                  marginTop: 18,
                  background: "#FF6B35",
                  color: "#F2ECE0",
                  border: "none",
                  borderRadius: 999,
                  padding: "14px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  cursor: status === "sending" ? "default" : "pointer",
                  opacity: status === "sending" ? 0.7 : 1,
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {status === "sending" ? "sending…" : "send magic link"}
              </button>
            </form>
          )}
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11.5,
            color: "rgba(242,236,224,0.4)",
            lineHeight: 1.5,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          No password needed. We&rsquo;ll email you a one-time link to sign in.
        </div>
      </div>
    </main>
  );
}
