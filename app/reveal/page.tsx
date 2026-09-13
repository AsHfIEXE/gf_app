"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArchiveShell, Eyebrow } from "@/components/archive-shell";
import { findApplication, saveApplication, setLastReportId } from "@/lib/application-store";

const fields = ["First name", "Nickname", "Instagram", "Discord", "Email", "Other contact method"];

export default function RevealPage() {
  return <Suspense fallback={<RevealLoading />}><RevealContent /></Suspense>;
}

function RevealContent() {
  const params = useSearchParams();
  const [reportId, setReportId] = useState(params.get("id") || "");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    const application = findApplication(reportId);
    if (!application || !["SELECTED", "CONTACT AVAILABLE"].includes(application.status)) { setError("This report is not available for contact reveal."); return; }
    setReportId(application.reportId); setLastReportId(application.reportId); setError(""); setVerified(true);
  };
  const reveal = () => {
    const application = findApplication(reportId);
    if (!application || selected.length === 0 || !message.trim()) return;
    application.revealedContact = { fields: selected, message: message.trim(), revealedAt: new Date().toISOString() };
    application.status = "CONTACT AVAILABLE"; application.updatedAt = new Date().toISOString(); saveApplication(application); setComplete(true);
  };
  return <ArchiveShell>
    <section className="standard-page reveal-page">
      <Eyebrow>IDENTITY CONSENT PROTOCOL</Eyebrow>
      {!verified ? <><h1>REVEAL <em>YOURSELF</em></h1><p className="page-intro">Only a selected report can begin this step. You decide what information gets shared.</p><form className="status-form" onSubmit={verify}><label htmlFor="reveal-id">SELECTED REPORT ID</label><div><input id="reveal-id" value={reportId} onChange={(event) => setReportId(event.target.value.toUpperCase())} placeholder="GF-XXXX-XXXX" /><button className="button button-primary">VERIFY <span>→</span></button></div></form>{error && <p className="field-error">{error}</p>}</> : complete ? <div className="reveal-complete"><h1>CONTACT <em>AVAILABLE.</em></h1><p>Your chosen details have been released to the archive reviewer. You are still in control of what you shared.</p></div> : <><h1>REPORT <em>VERIFIED.</em></h1><p className="page-intro">This application has been selected. Choose exactly what you&apos;d like to reveal.</p><div className="reveal-grid">{fields.map((field) => <label className={`reveal-choice ${selected.includes(field) ? "checked" : ""}`} key={field}><input type="checkbox" checked={selected.includes(field)} onChange={() => setSelected(selected.includes(field) ? selected.filter((item) => item !== field) : [...selected, field])} />{field}</label>)}</div><label className="contact-label">YOUR CONTACT DETAILS OR MESSAGE<textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Only include details you are comfortable sharing..." /></label><button className="button button-primary" onClick={reveal} disabled={selected.length === 0 || !message.trim()}>REVEAL MY CONTACT <span>→</span></button><p className="privacy-note">You control what information is shared. Nothing is revealed until you use this button.</p></>}
    </section>
  </ArchiveShell>;
}

function RevealLoading() {
  return <ArchiveShell><section className="standard-page reveal-page"><Eyebrow>IDENTITY CONSENT PROTOCOL</Eyebrow><h1>VERIFYING <em>REPORT...</em></h1></section></ArchiveShell>;
}
