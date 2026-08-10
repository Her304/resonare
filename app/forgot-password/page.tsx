"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authStyles as s } from "@/components/authStyles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!mail) return;

    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(mail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Too many reset emails for now. Wait a few minutes and try again."
          : error.message
      );
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={s.page}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={s.wordmark}>resonare</div>
        <div style={s.tagline}>reset your password</div>

        <div style={s.card}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={s.cardTitle}>check your inbox</div>
              <div style={s.cardBody}>
                If an account exists for <strong style={{ color: "#1a1816" }}>{email.trim()}</strong>, we sent a link to
                set a new password. Open it on this device.
              </div>
              <div style={{ marginTop: 18 }}>
                <Link href="/login" style={s.link}>
                  back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="email" style={s.label}>
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
                style={s.input}
              />

              {error && <div style={s.error}>{error}</div>}

              <button type="submit" disabled={busy} className="r-pressable" style={s.submit(busy)}>
                {busy ? "sending…" : "send reset link"}
              </button>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Link href="/login" style={s.link}>
                  back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <div style={s.footnote}>This is the only email Resonare sends.</div>
      </div>
    </main>
  );
}
