"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArchiveLogo } from "@/components/archive-shell";
import { ReportCard } from "@/components/report-card";
import { getLastReportId } from "@/lib/application-store";
import { useEffect, useState } from "react";

export default function SubmittedPage() {
  const params = useSearchParams();
  const [fallback, setFallback] = useState("GF-XXXX-XXXX");
  useEffect(() => setFallback(getLastReportId() || "GF-XXXX-XXXX"), []);
  const reportId = params.get("id") || fallback;
  return <main className="receipt-page">
    <header className="form-header"><ArchiveLogo /></header>
    <section className="receipt-content">
      <p className="receipt-burst">◌</p>
      <p className="eyebrow"><span />ARCHIVE TRANSMISSION COMPLETE</p>
      <h1>APPLICATION<br /><em>RECEIVED.</em></h1>
      <p className="receipt-intro">You made it to the archive. Your answers now exist without your name attached.</p>
      <ReportCard reportId={reportId} />
      <p className="receipt-copy">Remember it. If this ID is ever announced, you&apos;ll know.</p>
      <div className="receipt-actions"><Link className="button button-primary" href="/status">CHECK APPLICATION STATUS <span>→</span></Link><Link className="button button-quiet" href="/">RETURN TO ARCHIVE</Link></div>
    </section>
  </main>;
}
