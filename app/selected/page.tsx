"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArchiveShell, Eyebrow } from "@/components/archive-shell";

export default function SelectedPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    fetch("/api/selected", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((result: { ids: string[] }) => { setIds(result.ids); setLoadState("ready"); })
      .catch(() => setLoadState("error"));
  }, []);
  return <ArchiveShell className="selected-page">
    <section className="standard-page selected-content">
      <Eyebrow>PUBLIC TRANSMISSION / VERIFIED</Eyebrow>
      <h1>SOMEONE CAUGHT<br /><em>MY ATTENTION.</em></h1>
      {loadState === "loading" ? <p className="page-intro">Checking the archive…</p> : loadState === "error" ? <p className="page-intro">The archive is temporarily unavailable. Please check again shortly.</p> : ids.length > 0 ? <><p className="page-intro">One or more applications have been selected. If this is your report ID, you already know what it means.</p><div className="selected-ids">{ids.map((id) => <b key={id}>{id}</b>)}</div><Link className="button button-primary" href="/reveal">I HAVE THIS REPORT ID <span>→</span></Link></> : <><p className="page-intro">The archive is quiet for now. No report IDs have been announced.</p><p className="quiet-line">Selection is never a leaderboard. It&apos;s simply a moment of recognition.</p><Link className="button button-quiet" href="/apply">ENTER THE ARCHIVE <span>→</span></Link></>}
    </section>
  </ArchiveShell>;
}
