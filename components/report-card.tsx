"use client";

import { useState } from "react";

export function ReportCard({ reportId, caption = "THIS IS YOUR IDENTITY INSIDE THE ARCHIVE." }: { reportId: string; caption?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="report-card" aria-label={`Report ID ${reportId}`}>
      <div className="report-card__top"><span>APPLICATION ARCHIVE</span><span>CLASSIFIED</span></div>
      <div className="report-card__body">
        <small>REPORT ID</small>
        <strong>{reportId}</strong>
        <p>{caption}</p>
      </div>
      <button className="text-button" onClick={copy}>{copied ? "COPIED TO CLIPBOARD" : "COPY REPORT ID"}<span>↗</span></button>
    </section>
  );
}
