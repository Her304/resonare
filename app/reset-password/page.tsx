"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authStyles as s } from "@/components/authStyles";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // The recovery link is exchanged for a session by /auth/callback before we
  // land here — without one, updateUser has nothing to update.
  const [ready, setReady] = useState<"checking" | "ok" | "no-session">("checking");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(data.session ? "ok" : "no-session");
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }

    router.replace("/home");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={s.page}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={s.wordmark}>resonare</div>
        <div style={s.tagline}>set a new password</div>

        <div style={s.card}>
          {ready === "checking" ? (
            <div style={{ ...s.cardBody, marginTop: 0, textAlign: "center" }}>checking your link…</div>
          ) : ready === "no-session" ? (
            <div style={{ textAlign: "center" }}>
              <div style={s.cardTitle}>this link expired</div>
              <div style={s.cardBody}>Reset links can only be used once, and not long after they&rsquo;re sent.</div>
              <div style={{ marginTop: 18 }}>
                <Link href="/forgot-password" style={s.link}>
                  send a new one
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="password" style={s.label}>
                new password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 8 characters"
                className="r-input"
                style={s.input}
              />

              <div style={{ marginTop: 14 }}>
                <label htmlFor="confirm" style={s.label}>
                  confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="type it again"
                  className="r-input"
                  style={s.input}
                />
              </div>

              {error && <div style={s.error}>{error}</div>}

              <button type="submit" disabled={busy} className="r-pressable" style={s.submit(busy)}>
                {busy ? "saving…" : "save password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
