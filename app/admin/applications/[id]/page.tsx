"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";
import { AdminLogoutButton } from "@/components/admin-logout";
import { formatDate, statusLabel, type ApplicationRecord, type ApplicationStatus } from "@/lib/application-store";
import { questions, sections, visibleAnswer } from "@/lib/questions";

const ratingLabels = ["Chemistry", "Communication", "Humor", "Emotional fit", "Curiosity", "Overall interest"];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationRecord | null | undefined>(undefined);
  const [confirmStatus, setConfirmStatus] = useState<ApplicationStatus | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesRevision = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/applications/${params.id}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not open report."); return result.application as ApplicationRecord; })
      .then(setApplication)
      .catch((error) => { if (error.name !== "AbortError") setLoadError(error.message || "Could not open report."); });
    return () => controller.abort();
  }, [params.id]);

  const persist = async (updates: Partial<ApplicationRecord>, revision: number) => {
    if (!application) return;
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save report changes.");
      const saved = result.application as ApplicationRecord;
      setApplication((current) => current ? { ...saved, ...(notesRevision.current !== revision ? { adminNotes: current.adminNotes } : {}) } : saved);
      setSaveError("");
      if ("adminNotes" in updates) setNotesSaving(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save report changes.");
      if ("adminNotes" in updates) setNotesSaving(false);
    }
  };

  const update = (updates: Partial<ApplicationRecord>) => {
    if (!application) return;
    const next = { ...application, ...updates, updatedAt: new Date().toISOString() };
    setApplication(next);
    if ("adminNotes" in updates) {
      notesRevision.current += 1;
      const revision = notesRevision.current;
      setNotesSaving(true);
      if (notesTimer.current) clearTimeout(notesTimer.current);
      notesTimer.current = setTimeout(() => { void persist({ adminNotes: String(updates.adminNotes || "") }, revision); }, 500);
    } else {
      void persist(updates, notesRevision.current);
    }
  };
  const setStatus = (status: ApplicationStatus) => { update({ status }); setConfirmStatus(null); };
  if (application === undefined && !loadError) return <main className="admin-page" />;
  if (loadError) return <main className="admin-page"><header className="admin-header"><ArchiveLogo /><Link href="/admin">← ALL REPORTS</Link></header><section className="empty-state"><b>REPORT COULD NOT BE LOADED</b><p>{loadError}</p><Link className="button button-quiet" href="/admin">RETURN TO ARCHIVE</Link></section></main>;
  if (!application) return <main className="admin-page"><header className="admin-header"><ArchiveLogo /></header><section className="empty-state"><b>REPORT NOT FOUND</b><Link className="button button-quiet" href="/admin">RETURN TO ARCHIVE</Link></section></main>;
  return <main className="admin-page detail-page">
    <header className="admin-header"><ArchiveLogo /><div className="admin-detail-nav"><Link href="/admin">← ALL REPORTS</Link><AdminLogoutButton /></div></header>
    <section className="detail-content">
      <div className="detail-head"><div><p className="eyebrow"><span />REPORT FILE</p><h1>{application.reportId}</h1><p>SUBMITTED {formatDate(application.createdAt)} · <b>{statusLabel(application.status)}</b></p></div><span className={`status-pill ${application.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(application.status)}</span></div>
      <div className="detail-layout"><div className="report-answers">{sections.map((section) => { const sectionQuestions = questions.filter((question) => question.section === section.id).filter((question) => application.answers[question.id]); if (!sectionQuestions.length) return null; return <section className={`answer-section ${section.id === "final" ? "answer-section-final" : ""}`} key={section.id}><h2>{section.label}</h2>{sectionQuestions.map((question) => <div className="answer-item" key={question.id}><h3>{question.title}</h3><p>{visibleAnswer(application.answers[question.id])}</p></div>)}</section>; })}</div>
        <aside className="review-panel"><h2>YOUR ASSESSMENT</h2>{ratingLabels.map((label) => <div className="rating" key={label}><span>{label}</span><div>{[1, 2, 3, 4, 5].map((value) => <button className={(application.ratings?.[label] || 0) >= value ? "on" : ""} onClick={() => update({ ratings: { ...application.ratings, [label]: value } })} key={value} aria-label={`${label}: ${value} out of 5`}>●</button>)}</div></div>)}<label className="notes-label">ADMIN NOTES<textarea value={application.adminNotes} onChange={(event) => update({ adminNotes: event.target.value })} placeholder="Private notes. Never visible to the applicant." rows={7} /></label><p className="admin-save-state" aria-live="polite">{notesSaving ? "SAVING NOTES…" : saveError ? "SAVE NEEDS ATTENTION" : "CHANGES SAVED"}</p>{saveError && <p className="field-error" role="alert">{saveError}</p>}{application.revealedContact && <div className="contact-available"><b>CONTACT AVAILABLE</b><p>{application.revealedContact.fields.join(" · ")}</p><p>{application.revealedContact.message}</p></div>}{["SELECTED", "CONTACT AVAILABLE"].includes(application.status) && <section className="announcement-control"><b>PUBLIC ANNOUNCEMENT</b><p>{application.published ? "This report ID is visible on the public selected page." : "Selection is private until you choose to publish this report ID."}</p><button className="button button-quiet" onClick={() => update({ published: !application.published })}>{application.published ? "UNPUBLISH REPORT ID" : "PUBLISH REPORT ID"}</button></section>}<div className="decision-actions"><button className="button button-quiet" onClick={() => setStatus("SHORTLISTED")}>SHORTLIST</button><button className="button button-primary" onClick={() => setConfirmStatus("SELECTED")}>SELECT</button><button className="danger-action" onClick={() => setConfirmStatus("NOT SELECTED")}>REJECT</button></div></aside>
      </div>
    </section>
    {confirmStatus && <div className="modal-backdrop"><section className="confirm-modal"><p className="eyebrow"><span />CONFIRM DECISION</p><h2>{confirmStatus === "SELECTED" ? "SELECT APPLICATION?" : "REJECT APPLICATION?"}</h2><p>Report: <b>{application.reportId}</b></p><p>{confirmStatus === "SELECTED" ? "This marks the application as selected privately. The report ID will not be public until you publish it separately." : "This marks the report as not selected. This can be changed later."}</p><div><button className="button button-primary" onClick={() => setStatus(confirmStatus)}>CONFIRM {confirmStatus === "SELECTED" ? "SELECTION" : "REJECTION"}</button><button className="button button-quiet" onClick={() => setConfirmStatus(null)}>CANCEL</button></div></section></div>}
  </main>;
}
