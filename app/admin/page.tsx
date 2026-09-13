"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";
import { formatDate, getApplications, saveApplication, statusLabel, type ApplicationRecord, type ApplicationStatus } from "@/lib/application-store";

const filters: Array<"ALL" | ApplicationStatus> = ["ALL", "RECEIVED", "UNDER REVIEW", "SHORTLISTED", "SELECTED", "NOT SELECTED"];

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [search, setSearch] = useState("");
  useEffect(() => setApplications(getApplications()), []);
  const filtered = useMemo(() => applications.filter((application) => (filter === "ALL" || application.status === filter) && application.reportId.includes(search.toUpperCase())), [applications, filter, search]);
  const updateStatus = (application: ApplicationRecord, status: ApplicationStatus) => {
    const updated = { ...application, status, updatedAt: new Date().toISOString() };
    saveApplication(updated); setApplications((items) => items.map((item) => item.id === updated.id ? updated : item));
  };
  const count = (status?: ApplicationStatus) => status ? applications.filter((application) => application.status === status).length : applications.length;
  return <main className="admin-page">
    <header className="admin-header"><ArchiveLogo /><div><span>REVIEWER CONSOLE</span><Link href="/">VIEW PUBLIC ARCHIVE ↗</Link></div></header>
    <div className="admin-notice"><span>LOCAL PROTOTYPE</span> Application records are stored only in this browser. Add server authentication and a database before use with real applicants.</div>
    <section className="admin-content">
      <div className="admin-heading"><div><p className="eyebrow"><span />PRIVATE REVIEW AREA</p><h1>APPLICATION <em>ARCHIVE</em></h1></div><Link className="button button-primary" href="/apply">NEW APPLICATION VIEW <span>↗</span></Link></div>
      <div className="metrics-grid"><Metric label="TOTAL APPLICATIONS" value={count()} /><Metric label="UNREVIEWED" value={count("RECEIVED")} /><Metric label="SHORTLISTED" value={count("SHORTLISTED")} /><Metric label="SELECTED" value={count("SELECTED") + count("CONTACT AVAILABLE")} /></div>
      <div className="admin-toolbar"><div className="admin-filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "ALL" ? "ALL" : statusLabel(item)}</button>)}</div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="SEARCH REPORT ID..." /></div>
      <div className="application-list">{filtered.length === 0 ? <div className="empty-state"><b>NO REPORTS FOUND</b><p>Applications submitted in this browser will appear here.</p></div> : filtered.map((application) => <article className="admin-card" key={application.id}>
        <div className="admin-card__main"><div><h2>{application.reportId}</h2><p>SUBMITTED: {formatDate(application.createdAt)} · STATUS: <b>{statusLabel(application.status)}</b></p></div><span className={`status-pill ${application.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(application.status)}</span></div>
        <div className="answer-preview"><span>“</span>{application.answers.unobserved || application.answers.madeApply || application.answers.real || "No featured answer supplied."}<span>”</span></div>
        <div className="admin-card__actions"><Link className="button button-quiet" href={`/admin/applications/${application.id}`}>OPEN REPORT <span>→</span></Link>{application.status === "RECEIVED" && <button className="inline-action" onClick={() => updateStatus(application, "UNDER REVIEW")}>MARK REVIEWED</button>}{application.status !== "SHORTLISTED" && application.status !== "SELECTED" && <button className="inline-action" onClick={() => updateStatus(application, "SHORTLISTED")}>SHORTLIST</button>}</div>
      </article>)}</div>
    </section>
  </main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="metric"><span>{label}</span><b>{String(value).padStart(2, "0")}</b></div>; }
