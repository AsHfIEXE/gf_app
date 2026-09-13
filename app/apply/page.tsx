"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveLogo, Eyebrow } from "@/components/archive-shell";
import { QuestionInput } from "@/components/question-input";
import { createReportId, saveApplication, setLastReportId } from "@/lib/application-store";
import { questions, sections } from "@/lib/questions";

export default function ApplyPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const question = questions[index];
  const sectionIndex = sections.findIndex((section) => section.id === question.section);
  const section = sections[sectionIndex];
  const progress = Math.round(((index + 1) / questions.length) * 100);
  const sectionQuestionCount = useMemo(() => questions.filter(({ section: id }) => id === question.section).length, [question.section]);
  const sectionPosition = questions.filter(({ section: id }, questionIndex) => id === question.section && questionIndex <= index).length;

  const valid = () => {
    if (!question.required) return true;
    const value = answers[question.id]?.trim();
    if (!value) return false;
    return question.id !== "age" || (Number(value) >= 18 && Number.isFinite(Number(value)));
  };

  const continueForm = () => {
    if (!valid()) { setShowError(true); return; }
    setShowError(false);
    if (index === questions.length - 1) { submit(); return; }
    setIndex((value) => value + 1);
  };

  const submit = () => {
    setIsSubmitting(true);
    const reportId = createReportId();
    const timestamp = new Date().toISOString();
    saveApplication({
      id: crypto.randomUUID(), reportId, answers, status: "RECEIVED", createdAt: timestamp, updatedAt: timestamp,
      adminNotes: "", ratings: {},
    });
    setLastReportId(reportId);
    window.setTimeout(() => router.push(`/application/submitted?id=${encodeURIComponent(reportId)}`), 750);
  };

  return <main className={`form-page ${question.section === "final" ? "final-question" : ""}`}>
    <header className="form-header"><ArchiveLogo /><button className="exit-link" onClick={() => router.push("/")}>EXIT ARCHIVE <span>×</span></button></header>
    <aside className="form-sidebar">
      <p>APPLICATION PROGRESS</p>
      {sections.map((item, itemIndex) => <div className={`progress-section ${itemIndex === sectionIndex ? "active" : ""} ${itemIndex < sectionIndex ? "complete" : ""}`} key={item.id}>
        <span>{String(itemIndex + 1).padStart(2, "0")}</span><b>{item.short}</b><i>{itemIndex < sectionIndex ? "✓" : itemIndex === sectionIndex ? `${sectionPosition}/${sectionQuestionCount}` : ""}</i>
      </div>)}
      <div className="form-rule" />
      <small>YOUR ANSWERS ARE ANONYMOUS.<br />DO NOT INCLUDE CONTACT DETAILS.</small>
    </aside>
    <section className="question-stage">
      <div className="question-topline"><Eyebrow>{section.label}</Eyebrow><span>QUESTION {String(question.number).padStart(2, "0")} / 60</span></div>
      {question.section === "final" && <p className="last-thing">ONE LAST THING.</p>}
      <h1>{question.title}</h1>
      {question.hint && <p className="question-hint">{question.hint}</p>}
      <div className="question-field"><QuestionInput question={question} value={answers[question.id] || ""} onChange={(value) => { setAnswers({ ...answers, [question.id]: value }); setShowError(false); }} showError={showError} /></div>
      <div className="question-actions">
        <button className="button button-back" onClick={() => { setShowError(false); setIndex((value) => Math.max(0, value - 1)); }} disabled={index === 0}>← BACK</button>
        <button className="button button-primary" onClick={continueForm} disabled={isSubmitting}>{isSubmitting ? "SEALING FILE..." : index === questions.length - 1 ? "SUBMIT APPLICATION →" : "CONTINUE →"}</button>
      </div>
      <div className="full-progress"><span style={{ width: `${progress}%` }} /></div>
      <p className="form-note">{question.required ? "REQUIRED FIELD" : "OPTIONAL · YOU MAY SKIP THIS"}</p>
    </section>
  </main>;
}
