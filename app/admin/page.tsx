"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";
import { AdminLogoutButton } from "@/components/admin-logout";
import { formatDate, statusLabel, type ApplicationRecord, type ApplicationStatus } from "@/lib/application-store";

const filters: Array<"ALL" | ApplicationStatus> = ["ALL", "RECEIVED", "UNDER REVIEW", "SHORTLISTED", "SELECTED", "CONTACT AVAILABLE", "NOT SELECTED"];
type SortOrder = "NEWEST" | "OLDEST" | "RATING";
const pageSize = 25;

export default function AdminPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"ALL" | ApplicationStatus>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("NEWEST");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setOffset(0); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ status: filter, q: search, sort, limit: String(pageSize), offset: String(offset) });
    setLoading(true); setError("");
    fetch(`/api/admin/applications?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load applications.");
        return result as { applications: ApplicationRecord[]; counts: Record<string, number>; total: number };
      })
      .then((result) => { setApplications(result.applications); setCounts(result.counts); setTotal(result.total); })
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message || "Could not load applications."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filter, search, sort, offset, refresh]);

  const updateStatus = async (application: ApplicationRecord, status: ApplicationStatus) => {
    setError("");
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update application status.");
      setRefresh((value) => value + 1);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not update application status."); }
  };

  const exportRegister = () => {
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [["Report ID", "Status", "Submitted", "Overall interest"], ...applications.map((application) => [application.reportId, statusLabel(application.status), new Date(application.createdAt).toISOString(), application.ratings?.["Overall interest"] || ""])]
      .map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${rows}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gf-archive-register-page-${Math.floor(offset / pageSize) + 1}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const count = (status: "ALL" | ApplicationStatus) => status === "ALL" ? Object.values(counts).reduce((sum, value) => sum + value, 0) : counts[status] || 0;
  const first = total ? offset + 1 : 0;
  const last = Math.min(offset + applications.length, total);

  return <main className="admin-page">
    <header className="admin-header"><ArchiveLogo /><div><span>REVIEWER CONSOLE</span><Link href="/">VIEW PUBLIC ARCHIVE ↗</Link><AdminLogoutButton /></div></header>
    <div className="admin-notice"><span>SERVER ARCHIVE</span> Applications and review changes are stored centrally in the connected database.</div>
    <section className="admin-content">
      <div className="admin-heading"><div><p className="eyebrow"><span />PRIVATE REVIEW AREA</p><h1>APPLICATION <em>ARCHIVE</em></h1></div><button className="button button-quiet" onClick={exportRegister} disabled={!applications.length}>EXPORT THIS PAGE <span>↓</span></button></div>
      <div className="metrics-grid"><Metric label="TOTAL APPLICATIONS" value={count("ALL")} /><Metric label="UNREVIEWED" value={count("RECEIVED")} /><Metric label="SHORTLISTED" value={count("SHORTLISTED")} /><Metric label="SELECTED" value={count("SELECTED") + count("CONTACT AVAILABLE")} /></div>
      <div className="admin-toolbar"><div className="admin-filters" aria-label="Filter applications by status">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => { setFilter(item); setOffset(0); }}>{item === "ALL" ? `ALL · ${count("ALL")}` : `${statusLabel(item)} · ${count(item)}`}</button>)}</div><div className="admin-tools"><label className="sr-only" htmlFor="application-search">Search report IDs, answers, and notes</label><input id="application-search" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setOffset(0); }} placeholder="SEARCH ID, ANSWERS, NOTES..." /><label className="sr-only" htmlFor="application-sort">Sort applications</label><select id="application-sort" value={sort} onChange={(event) => { setSort(event.target.value as SortOrder); setOffset(0); }}><option value="NEWEST">NEWEST FIRST</option><option value="OLDEST">OLDEST FIRST</option><option value="RATING">HIGHEST INTEREST</option></select></div></div>
      <p className="admin-result-count">{loading ? "LOADING APPLICATIONS…" : `SHOWING ${first}–${last} OF ${total} MATCHING APPLICATIONS`}</p>
      {error && <div className="lookup-message error-message"><b>ARCHIVE REQUEST FAILED</b><p>{error}</p></div>}
      <div className="application-list">{!loading && !error && applications.length === 0 ? <div className="empty-state"><b>NO REPORTS FOUND</b><p>{total ? "Try a different status or search term." : "New applications will be stored in the central archive."}</p></div> : applications.map((application) => <article className="admin-card" key={application.id}>
        <div className="admin-card__main"><div><h2>{application.reportId}</h2><p>SUBMITTED: {formatDate(application.createdAt)} · STATUS: <b>{statusLabel(application.status)}{application.published ? " · PUBLIC" : ""}</b></p></div><span className={`status-pill ${application.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(application.status)}</span></div>
        {(application.ratings?.["Overall interest"] || 0) > 0 && <p className="admin-rating-summary">OVERALL INTEREST <b>{application.ratings["Overall interest"]} / 5</b></p>}
        <div className="answer-preview"><span>“</span>{application.answers.unobserved || application.answers.madeApply || application.answers.real || "No featured answer supplied."}<span>”</span></div>
        <div className="admin-card__actions"><Link className="button button-quiet" href={`/admin/applications/${application.id}`}>OPEN REPORT <span>→</span></Link>{application.status === "RECEIVED" && <button className="inline-action" onClick={() => updateStatus(application, "UNDER REVIEW")}>MARK REVIEWED</button>}{application.status !== "SHORTLISTED" && application.status !== "SELECTED" && application.status !== "CONTACT AVAILABLE" && <button className="inline-action" onClick={() => updateStatus(application, "SHORTLISTED")}>SHORTLIST</button>}</div>
      </article>)}</div>
      <nav className="admin-pagination" aria-label="Application pages"><button className="button button-quiet" disabled={offset === 0 || loading} onClick={() => setOffset((value) => Math.max(0, value - pageSize))}>← PREVIOUS</button><span>PAGE {total ? Math.floor(offset / pageSize) + 1 : 0} OF {Math.max(1, Math.ceil(total / pageSize))}</span><button className="button button-quiet" disabled={offset + pageSize >= total || loading} onClick={() => setOffset((value) => value + pageSize)}>NEXT →</button></nav>
    </section>
  </main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="metric"><span>{label}</span><b>{String(value).padStart(2, "0")}</b></div>; }
