import Link from "next/link";
import "./legal.css";

// Shared chrome for /terms, /privacy and /community-guidelines. Plain document
// styling on purpose — these are meant to read as policies, not as app screens.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-doc">
      <div className="legal-doc__inner">
        <nav className="legal-doc__nav">
          <Link href="/" className="legal-doc__brand">
            resonare
          </Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/community-guidelines">Community Guidelines</Link>
          <Link href="/login">Sign in</Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
