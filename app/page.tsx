import Link from "next/link";
import { ArchiveShell, Eyebrow, Footer } from "@/components/archive-shell";

export default function LandingPage() {
  return <ArchiveShell className="landing-page">
    <div className="landing-grid" />
    <section className="hero">
      <Eyebrow>ARCHIVE OPEN · EST. 2026</Eyebrow>
      <h1>THE<br /><em>APPLICATION</em></h1>
      <p className="hero-subtitle">Somewhere between coincidence and intention, there might be someone worth meeting.</p>
      <div className="hero-rule" />
      <div className="hero-copy">
        <p>You are about to submit an anonymous application for something slightly unusual.</p>
        <p>No name. No profile picture. No social media. No pretending to be someone you&apos;re not.</p>
        <p>Just your answers.</p>
        <p>If your application catches my attention, your Application Report ID may be announced. And if you recognize it... <em>you&apos;ll know.</em></p>
      </div>
      <div className="hero-actions">
        <Link className="button button-primary" href="/apply">BEGIN APPLICATION <span>→</span></Link>
        <Link className="button button-quiet" href="/how-it-works">HOW IT WORKS <span>↗</span></Link>
      </div>
    </section>
    <aside className="archive-stamp">
      <span>CASE FILE</span><b>GF / 2026</b><span>IDENTITY: WITHHELD</span>
      <div className="stamp-lines">■■■■■■■■■■■■■■■■</div>
    </aside>
    <Footer />
  </ArchiveShell>;
}
