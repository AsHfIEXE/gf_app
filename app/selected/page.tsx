"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArchiveShell, Eyebrow } from "@/components/archive-shell";
import { getApplications } from "@/lib/application-store";

export default function SelectedPage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getApplications().filter(({ status }) => status === "SELECTED" || status === "CONTACT AVAILABLE").map(({ reportId }) => reportId)), []);
  return <ArchiveShell className="selected-page">
    <section className="standard-page selected-content">
      <Eyebrow>PUBLIC TRANSMISSION / VERIFIED</Eyebrow>
      <h1>SOMEONE CAUGHT<br /><em>MY ATTENTION.</em></h1>
      {ids.length > 0 ? <><p className="page-intro">One or more applications have been selected. If this is your report ID, you already know what it means.</p><div className="selected-ids">{ids.map((id) => <b key={id}>{id}</b>)}</div><Link className="button button-primary" href="/reveal">I HAVE THIS REPORT ID <span>→</span></Link></> : <><p className="page-intro">The archive is quiet for now. No report IDs have been announced.</p><p className="quiet-line">Selection is never a leaderboard. It&apos;s simply a moment of recognition.</p><Link className="button button-quiet" href="/apply">ENTER THE ARCHIVE <span>→</span></Link></>}
    </section>
  </ArchiveShell>;
}
