"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authStyles as s } from "@/components/authStyles";
import { POLICY_VERSION } from "@/lib/legal";

type Mode = "signin" | "signup";
type UsernameState = "empty" | "invalid" | "checking" | "free" | "taken" | "unknown";

const USERNAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$/;

// useSearchParams needs a Suspense boundary for this route to stay prerendered.
export default function AuthPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" style={s.page} />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  // The landing page links to /login?mode=signup so its CTAs open straight
  // onto the create-account tab.
  const initialMode: Mode = useSearchParams().get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Only reachable when the project still has "Confirm email" switched on.
  const [confirmSent, setConfirmSent] = useState(false);
  const [nameState, setNameState] = useState<UsernameState>("empty");

  // Guards against a slow check overwriting the result of a newer one.
  const checkSeq = useRef(0);

  const checkUsername = useCallback(async (value: string) => {
    const seq = ++checkSeq.current;
    if (!value) return setNameState("empty");
    if (!USERNAME_RE.test(value)) return setNameState("invalid");

    setNameState("checking");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("username_available", { candidate: value });
    if (seq !== checkSeq.current) return; // a newer keystroke already won
    if (error) return setNameState("unknown");
    setNameState(data ? "free" : "taken");
  }, []);

  // Debounce the availability lookup while typing.
  useEffect(() => {
    if (mode !== "signup") return;
    const value = username.trim();
    if (!value) {
      setNameState("empty");
      return;
    }
    if (!USERNAME_RE.test(value)) {
      setNameState("invalid");
      return;
    }
    const t = setTimeout(() => checkUsername(value), 400);
    return () => clearTimeout(t);
  }, [username, mode, checkUsername]);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirm("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!mail || !password) return;

    setBusy(true);
    setError("");
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      if (error) {
        setBusy(false);
        setError(
          error.message === "Invalid login credentials"
            ? "That email and password don't match."
            : error.message
        );
        return;
      }
    } else {
      const handle = username.trim();

      if (!USERNAME_RE.test(handle)) {
        setBusy(false);
        setError("Usernames are 3–20 characters: letters, numbers and underscores, starting with a letter or number.");
        return;
      }
      if (nameState === "taken") {
        setBusy(false);
        setError("That username is already taken.");
        return;
      }
      if (password.length < 8) {
        setBusy(false);
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setBusy(false);
        setError("Those passwords don't match.");
        return;
      }
      if (!accepted) {
        setBusy(false);
        setError("Please accept the terms, guidelines and data notice to continue.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: {
          data: {
            username: handle,
            display_name: handle,
            terms_version: POLICY_VERSION,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setBusy(false);
        // The profile trigger enforces uniqueness; a race between the
        // availability check and the insert surfaces as a generic DB error.
        setError(
          /database error/i.test(error.message)
            ? "That username was just taken. Try another."
            : error.message
        );
        return;
      }
      // No session means the project requires email confirmation first.
      if (!data.session) {
        setBusy(false);
        setConfirmSent(true);
        return;
      }
    }

    // The session cookie is set — refresh so middleware sees it, then land in the app.
    router.replace("/home");
    router.refresh();
  }

  const nameHint: Record<UsernameState, { text: string; color: string } | null> = {
    empty: null,
    invalid: { text: "3–20 characters — letters, numbers and underscores.", color: "#8f8a85" },
    checking: { text: "checking…", color: "#8f8a85" },
    free: { text: `${username.trim()} is available`, color: "#0F5E5E" },
    taken: { text: "that username is taken", color: "#c0392b" },
    unknown: { text: "couldn't check right now — you can still try it", color: "#8f8a85" },
  };
  const hint = mode === "signup" ? nameHint[nameState] : null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={s.page}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={s.wordmark}>resonare</div>
        <div style={s.tagline}>your concert diary</div>

        <div style={s.card}>
          {confirmSent ? (
            <div style={{ textAlign: "center" }}>
              <div style={s.cardTitle}>confirm your email</div>
              <div style={s.cardBody}>
                We sent a confirmation link to <strong style={{ color: "#1a1816" }}>{email.trim()}</strong>. Open it to
                finish creating your account.
              </div>
              <button
                onClick={() => {
                  setConfirmSent(false);
                  switchMode("signin");
                }}
                style={s.linkButton}
              >
                back to sign in
              </button>
            </div>
          ) : (
            <>
              <div style={s.tabs}>
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    style={{ ...s.tab, ...(mode === m ? s.tabActive : null) }}
                  >
                    {m === "signin" ? "sign in" : "create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} style={{ marginTop: 20 }}>
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

                {mode === "signup" && (
                  <div style={{ marginTop: 14 }}>
                    <label htmlFor="username" style={s.label}>
                      username
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={s.inputPrefix}>@</span>
                      <input
                        id="username"
                        type="text"
                        required
                        autoComplete="username"
                        spellCheck={false}
                        autoCapitalize="none"
                        maxLength={20}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                        placeholder="frontrow"
                        className="r-input"
                        style={{ ...s.input, paddingLeft: 30 }}
                      />
                    </div>
                    {hint && (
                      <div style={{ ...s.hint, color: hint.color }} aria-live="polite">
                        {hint.text}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <label htmlFor="password" style={s.label}>
                    password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "at least 8 characters" : "••••••••"}
                    className="r-input"
                    style={s.input}
                  />
                </div>

                {mode === "signup" && (
                  <div style={{ marginTop: 14 }}>
                    <label htmlFor="confirmPassword" style={s.label}>
                      confirm password
                    </label>
                    <input
                      id="confirmPassword"
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
                    {confirm && password !== confirm && (
                      <div style={{ ...s.hint, color: "#c0392b" }}>those passwords don&rsquo;t match</div>
                    )}
                  </div>
                )}

                {mode === "signup" && (
                  <label htmlFor="accept" style={s.consent}>
                    <input
                      id="accept"
                      type="checkbox"
                      required
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      style={s.checkbox}
                    />
                    <span>
                      I have read and agree to the{" "}
                      <Link href="/terms" target="_blank" style={s.inlineLink}>
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/community-guidelines" target="_blank" style={s.inlineLink}>
                        Community Guidelines
                      </Link>
                      , and I understand that Resonare collects and processes my personal data as described
                      in the{" "}
                      <Link href="/privacy" target="_blank" style={s.inlineLink}>
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                )}

                {error && <div style={s.error}>{error}</div>}

                {/* Deliberately not disabled when consent is unticked — a dead
                    button reads as broken. The submit handler explains instead. */}
                <button type="submit" disabled={busy} className="r-pressable" style={s.submit(busy)}>
                  {busy ? "one moment…" : mode === "signin" ? "sign in" : "create account"}
                </button>
              </form>

              {mode === "signin" && (
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <Link href="/forgot-password" style={s.link}>
                    forgot your password?
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div style={s.footnote}>
          {mode === "signup"
            ? "Your password is hashed and stored by Supabase Auth. We never see it."
            : "Signed in sessions stay put on this device until you sign out."}
        </div>
      </div>
    </main>
  );
}
