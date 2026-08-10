import type { CSSProperties } from "react";

// Shared pixel-exact styles for the signed-out auth screens
// (/login, /forgot-password, /reset-password).
const inter = "var(--font-inter), sans-serif";
const serif = "var(--font-noto-serif-jp), serif";

export const authStyles = {
  page: {
    background: "radial-gradient(120% 90% at 50% 0%, #0F5E5E 0%, #082F2F 55%, #061f1f 100%)",
  } as CSSProperties,

  wordmark: {
    fontFamily: serif,
    fontWeight: 700,
    fontSize: 32,
    letterSpacing: "-0.5px",
    color: "#F2ECE0",
    textAlign: "center",
  } as CSSProperties,

  tagline: {
    fontSize: 12.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(242,236,224,0.55)",
    textAlign: "center",
    marginTop: 8,
    fontFamily: inter,
  } as CSSProperties,

  card: {
    marginTop: 32,
    background: "#F2ECE0",
    border: "1px solid rgba(15,94,94,0.16)",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 24px 60px -20px rgba(2,16,16,0.6)",
  } as CSSProperties,

  cardTitle: {
    fontFamily: serif,
    fontWeight: 700,
    fontSize: 19,
    color: "#1a1816",
  } as CSSProperties,

  cardBody: {
    fontSize: 13.5,
    color: "#8f8a85",
    marginTop: 8,
    lineHeight: 1.55,
    fontFamily: inter,
  } as CSSProperties,

  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    background: "rgba(15,94,94,0.06)",
    border: "1px solid rgba(15,94,94,0.08)",
    borderRadius: 999,
    padding: 4,
  } as CSSProperties,

  tab: {
    border: "none",
    background: "transparent",
    borderRadius: 999,
    padding: "9px 8px",
    fontSize: 13,
    fontWeight: 600,
    color: "#8f8a85",
    cursor: "pointer",
    fontFamily: inter,
  } as CSSProperties,

  tabActive: {
    background: "#fff",
    color: "#0F5E5E",
    boxShadow: "0 1px 3px rgba(2,16,16,0.12)",
  } as CSSProperties,

  label: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8f8a85",
    fontFamily: inter,
  } as CSSProperties,

  input: {
    width: "100%",
    marginTop: 8,
    background: "#fff",
    border: "1px solid rgba(15,94,94,0.2)",
    borderRadius: 12,
    color: "#1a1816",
    fontSize: 15,
    padding: "13px 14px",
    outline: "none",
    fontFamily: inter,
  } as CSSProperties,

  inputPrefix: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    marginTop: 4,
    fontSize: 15,
    color: "#8f8a85",
    pointerEvents: "none",
    fontFamily: inter,
  } as CSSProperties,

  hint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 1.4,
    fontFamily: inter,
  } as CSSProperties,

  consent: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 18,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#6b6560",
    cursor: "pointer",
    fontFamily: inter,
  } as CSSProperties,

  checkbox: {
    width: 16,
    height: 16,
    marginTop: 1,
    flexShrink: 0,
    accentColor: "#FF6B35",
    cursor: "pointer",
  } as CSSProperties,

  inlineLink: {
    color: "#0F5E5E",
    fontWeight: 600,
    textDecoration: "underline",
  } as CSSProperties,

  error: {
    marginTop: 12,
    fontSize: 12.5,
    color: "#c0392b",
    lineHeight: 1.45,
    fontFamily: inter,
  } as CSSProperties,

  submit: (busy: boolean): CSSProperties => ({
    width: "100%",
    marginTop: 18,
    background: "#FF6B35",
    color: "#F2ECE0",
    border: "none",
    borderRadius: 999,
    padding: "14px",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: busy ? "default" : "pointer",
    opacity: busy ? 0.7 : 1,
    fontFamily: inter,
  }),

  link: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: inter,
  } as CSSProperties,

  linkButton: {
    marginTop: 18,
    background: "transparent",
    border: "none",
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: inter,
  } as CSSProperties,

  footnote: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 11.5,
    color: "rgba(242,236,224,0.4)",
    lineHeight: 1.5,
    fontFamily: inter,
  } as CSSProperties,
};
