"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchiveLogo } from "@/components/archive-shell";
import { AdminLogoutButton } from "@/components/admin-logout";
import { formatDate, getApplications, saveApplication, statusLabel, type ApplicationRecord, type ApplicationStatus } from "@/lib/application-store";
import { questions, sections, visibleAnswer } from "@/lib/questions";

const ratingLabels = ["Chemistry", "Communication", "Humor", "Emotional fit", "Curiosity", "Overall interest"];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationRecord | null | undefined>(undefined);
  const [confirmStatus, setConfirmStatus] = useState<ApplicationStatus | null>(null);
  useEffect(() => setApplication(getApplications().find((item) => item.id === params.id) || null), [params.id]);
  const update = (updates: Partial<ApplicationRecord>) => { if (!application) return; const next = { ...application, ...updates, updatedAt: new Date().toISOString() }; saveApplication(next); setApplication(next); };
  const setStatus = (status: ApplicationStatus) => { update({ status }); setConfirmStatus(null); };
  if (application === undefined) return <main className="admin-page" />;
  if (!application) return <main className="admin-page"><header className="admin-header"><ArchiveLogo /></header><section className="empty-state"><b>REPORT NOT FOUND</b><Link className="button button-quiet" href="/admin">RETURN TO ARCHIVE</Link></section></main>;
  return <main className="admin-page detail-page">
    <header className="admin-header"><ArchiveLogo /><div className="admin-detail-nav"><Link href="/admin">← ALL REPORTS</Link><AdminLogoutButton /></div></header>
    <section className="detail-content">
      <div className="detail-head"><div><p className="eyebrow"><span />REPORT FILE</p><h1>{application.reportId}</h1><p>SUBMITTED {formatDate(application.createdAt)} · <b>{statusLabel(application.status)}</b></p></div><span className={`status-pill ${application.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(application.status)}</span></div>
      <div className="detail-layout"><div className="report-answers">{sections.map((section) => { const sectionQuestions = questions.filter((question) => question.section === section.id).filter((question) => application.answers[question.id]); if (!sectionQuestions.length) return null; return <section className={`answer-section ${section.id === "final" ? "answer-section-final" : ""}`} key={section.id}><h2>{section.label}</h2>{sectionQuestions.map((question) => <div className="answer-item" key={question.id}><h3>{question.title}</h3><p>{visibleAnswer(application.answers[question.id])}</p></div>)}</section>; })}</div>
        <aside className="review-panel"><h2>YOUR ASSESSMENT</h2>{ratingLabels.map((label) => <div className="rating" key={label}><span>{label}</span><div>{[1, 2, 3, 4, 5].map((value) => <button className={(application.ratings[label] || 0) >= value ? "on" : ""} onClick={() => update({ ratings: { ...application.ratings, [label]: value } })} key={value} aria-label={`${label}: ${value} out of 5`}>●</button>)}</div></div>)}<label className="notes-label">ADMIN NOTES<textarea value={application.adminNotes} onChange={(event) => update({ adminNotes: event.target.value })} placeholder="Private notes. Never visible to the applicant." rows={7} /></label>{application.revealedContact && <div className="contact-available"><b>CONTACT AVAILABLE</b><p>{application.revealedContact.fields.join(" · ")}</p><p>{application.revealedContact.message}</p></div>}<div className="decision-actions"><button className="button button-quiet" onClick={() => setStatus("SHORTLISTED")}>SHORTLIST</button><button className="button button-primary" onClick={() => setConfirmStatus("SELECTED")}>SELECT</button><button className="danger-action" onClick={() => setConfirmStatus("NOT SELECTED")}>REJECT</button></div></aside>
      </div>
    </section>
    {confirmStatus && <div className="modal-backdrop"><section className="confirm-modal"><p className="eyebrow"><span />CONFIRM DECISION</p><h2>{confirmStatus === "SELECTED" ? "SELECT APPLICATION?" : "REJECT APPLICATION?"}</h2><p>Report: <b>{application.reportId}</b></p><p>{confirmStatus === "SELECTED" ? "This marks the application as selected. You can publish its report ID separately." : "This marks the report as not selected. This can be changed later."}</p><div><button className="button button-primary" onClick={() => setStatus(confirmStatus)}>CONFIRM {confirmStatus === "SELECTED" ? "SELECTION" : "REJECTION"}</button><button className="button button-quiet" onClick={() => setConfirmStatus(null)}>CANCEL</button></div></section></div>}
  </main>;
}
