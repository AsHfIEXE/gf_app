import Link from "next/link";
import type { ReactNode } from "react";

export function ArchiveLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="archive-logo" href="/" aria-label="The Application home">
      <span className="archive-seal">GF</span>
      {!compact && <span><b>THE APPLICATION</b><i>PRIVATE ARCHIVE</i></span>}
    </Link>
  );
}

export function ArchiveShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`archive-shell ${className}`}>
      <header className="site-header">
        <ArchiveLogo />
        <nav aria-label="Primary navigation">
          <Link href="/how-it-works">HOW IT WORKS</Link>
          <Link href="/status">CHECK STATUS</Link>
          <Link href="/selected">SELECTED</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span />{children}</p>;
}

export function Footer() {
  return <footer className="site-footer"><span>18+ ONLY</span><span>ANONYMOUS BY DESIGN</span><span>NO GUARANTEES · NO PRESSURE</span></footer>;
}
