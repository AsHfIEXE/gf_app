"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";
import { AdminLogoutButton } from "@/components/admin-logout";
import { formatDate, getApplications, saveApplication, statusLabel, type ApplicationRecord, type ApplicationStatus } from "@/lib/application-store";

const filters: Array<"ALL" | ApplicationStatus> = ["ALL", "RECEIVED", "UNDER REVIEW", "SHORTLISTED", "SELECTED", "CONTACT AVAILABLE", "NOT SELECTED"];
type SortOrder = "NEWEST" | "OLDEST" | "RATING";

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("NEWEST");
  useEffect(() => {
    const refresh = () => setApplications(getApplications());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const filtered = useMemo(() => applications
    .filter((application) => filter === "ALL" || application.status === filter)
    .filter((application) => {
      const query = search.trim().toLocaleUpperCase();
      if (!query) return true;
      return [application.reportId, ...Object.values(application.answers), application.adminNotes]
        .some((value) => value.toLocaleUpperCase().includes(query));
    })
    .sort((a, b) => {
      if (sort === "OLDEST") return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      if (sort === "RATING") return (b.ratings?.["Overall interest"] || 0) - (a.ratings?.["Overall interest"] || 0) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }), [applications, filter, search, sort]);
  const updateStatus = (application: ApplicationRecord, status: ApplicationStatus) => {
    const updated = { ...application, status, updatedAt: new Date().toISOString() };
    saveApplication(updated); setApplications((items) => items.map((item) => item.id === updated.id ? updated : item));
  };
  const count = (status?: ApplicationStatus) => status ? applications.filter((application) => application.status === status).length : applications.length;
  const exportRegister = () => {
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [["Report ID", "Status", "Submitted", "Overall interest"], ...filtered.map((application) => [application.reportId, statusLabel(application.status), new Date(application.createdAt).toISOString(), application.ratings?.["Overall interest"] || ""])]
      .map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${rows}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gf-archive-register-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <main className="admin-page">
    <header className="admin-header"><ArchiveLogo /><div><span>REVIEWER CONSOLE</span><Link href="/">VIEW PUBLIC ARCHIVE ↗</Link><AdminLogoutButton /></div></header>
    <div className="admin-notice"><span>BROWSER STORAGE</span> Applications and review changes are stored in this browser. Open this dashboard in the browser where applications were submitted.</div>
    <section className="admin-content">
      <div className="admin-heading"><div><p className="eyebrow"><span />PRIVATE REVIEW AREA</p><h1>APPLICATION <em>ARCHIVE</em></h1></div><button className="button button-quiet" onClick={exportRegister} disabled={!filtered.length}>EXPORT REGISTER <span>↓</span></button></div>
      <div className="metrics-grid"><Metric label="TOTAL APPLICATIONS" value={count()} /><Metric label="UNREVIEWED" value={count("RECEIVED")} /><Metric label="SHORTLISTED" value={count("SHORTLISTED")} /><Metric label="SELECTED" value={count("SELECTED") + count("CONTACT AVAILABLE")} /></div>
      <div className="admin-toolbar"><div className="admin-filters" aria-label="Filter applications by status">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "ALL" ? `ALL · ${count()}` : `${statusLabel(item)} · ${count(item)}`}</button>)}</div><div className="admin-tools"><label className="sr-only" htmlFor="application-search">Search report IDs, answers, and notes</label><input id="application-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="SEARCH ID, ANSWERS, NOTES..." /><label className="sr-only" htmlFor="application-sort">Sort applications</label><select id="application-sort" value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}><option value="NEWEST">NEWEST FIRST</option><option value="OLDEST">OLDEST FIRST</option><option value="RATING">HIGHEST INTEREST</option></select></div></div>
      <p className="admin-result-count">SHOWING {filtered.length} OF {applications.length} APPLICATIONS</p>
      <div className="application-list">{filtered.length === 0 ? <div className="empty-state"><b>NO REPORTS FOUND</b><p>Try a different status or search term. New applications from this browser will appear here.</p></div> : filtered.map((application) => <article className="admin-card" key={application.id}>
        <div className="admin-card__main"><div><h2>{application.reportId}</h2><p>SUBMITTED: {formatDate(application.createdAt)} · STATUS: <b>{statusLabel(application.status)}</b></p></div><span className={`status-pill ${application.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(application.status)}</span></div>
        {(application.ratings?.["Overall interest"] || 0) > 0 && <p className="admin-rating-summary">OVERALL INTEREST <b>{application.ratings["Overall interest"]} / 5</b></p>}
        <div className="answer-preview"><span>“</span>{application.answers.unobserved || application.answers.madeApply || application.answers.real || "No featured answer supplied."}<span>”</span></div>
        <div className="admin-card__actions"><Link className="button button-quiet" href={`/admin/applications/${application.id}`}>OPEN REPORT <span>→</span></Link>{application.status === "RECEIVED" && <button className="inline-action" onClick={() => updateStatus(application, "UNDER REVIEW")}>MARK REVIEWED</button>}{application.status !== "SHORTLISTED" && application.status !== "SELECTED" && <button className="inline-action" onClick={() => updateStatus(application, "SHORTLISTED")}>SHORTLIST</button>}</div>
      </article>)}</div>
    </section>
  </main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="metric"><span>{label}</span><b>{String(value).padStart(2, "0")}</b></div>; }
