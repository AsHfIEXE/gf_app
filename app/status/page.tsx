"use client";

import { useState } from "react";
import Link from "next/link";
import { ArchiveShell, Eyebrow } from "@/components/archive-shell";
import { findApplication, formatDate, statusLabel, type ApplicationRecord } from "@/lib/application-store";

export default function StatusPage() {
  const [reportId, setReportId] = useState("");
  const [result, setResult] = useState<ApplicationRecord | null | "not-found">(null);
  const check = (event: React.FormEvent) => { event.preventDefault(); setResult(findApplication(reportId) || "not-found"); };

  return <ArchiveShell>
    <section className="standard-page status-page">
      <Eyebrow>ARCHIVE ACCESS / APPLICANT</Eyebrow>
      <h1>CHECK YOUR <em>STATUS</em></h1>
      <p className="page-intro">Enter your report ID exactly as it was issued. Your report stays anonymous.</p>
      <form className="status-form" onSubmit={check}>
        <label htmlFor="report-id">APPLICATION REPORT ID</label>
        <div><input id="report-id" value={reportId} onChange={(event) => setReportId(event.target.value.toUpperCase())} placeholder="GF-XXXX-XXXX" autoComplete="off" /><button className="button button-primary">CHECK STATUS <span>→</span></button></div>
      </form>
      {result === "not-found" && <section className="lookup-message error-message"><b>NO REPORT FOUND</b><p>Check the ID and try again. For privacy, no additional information is shown.</p></section>}
      {result && result !== "not-found" && <section className="status-card">
        <div className="status-card__title"><span>APPLICATION STATUS</span><span className={`status-pill ${result.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(result.status)}</span></div>
        <dl><div><dt>REPORT ID</dt><dd>{result.reportId}</dd></div><div><dt>SUBMITTED</dt><dd>{formatDate(result.createdAt)}</dd></div><div><dt>SELECTION</dt><dd>{result.status === "SELECTED" || result.status === "CONTACT AVAILABLE" ? "ANNOUNCED" : "NOT YET ANNOUNCED"}</dd></div></dl>
        {(result.status === "SELECTED" || result.status === "CONTACT AVAILABLE") && <Link className="button button-primary" href={`/reveal?id=${result.reportId}`}>I HAVE THIS REPORT ID <span>→</span></Link>}
      </section>}
      <p className="privacy-note">Your report ID is private. We never ask you to put your real identity into the application.</p>
    </section>
  </ArchiveShell>;
}
