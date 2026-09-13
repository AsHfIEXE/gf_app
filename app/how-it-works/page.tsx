import Link from "next/link";
import { ArchiveShell, Eyebrow } from "@/components/archive-shell";

const steps = [
  ["01", "APPLY", "Answer honestly. There are no perfect answers, and no need to attach your name."],
  ["02", "RECEIVE YOUR ID", "You receive a private report ID, like GF-8K4M-271Q. Save it somewhere safe."],
  ["03", "GET REVIEWED", "The application is reviewed without requiring your real identity."],
  ["04", "GET SELECTED", "If an application is selected, only its report ID is publicly announced."],
];

export default function HowItWorksPage() {
  return <ArchiveShell>
    <section className="standard-page how-page">
      <Eyebrow>OPERATIONAL BRIEF / 01</Eyebrow>
      <h1>HOW THE <em>ARCHIVE</em> WORKS</h1>
      <p className="page-intro">A small system for beginning with curiosity instead of a profile.</p>
      <div className="steps-grid">{steps.map(([number, title, copy]) => <article className="step-card" key={number}>
        <span>{number}</span><h2>{title}</h2><p>{copy}</p>
      </article>)}</div>
      <blockquote>You don&apos;t need to impress me.<br />You just need to be yourself.</blockquote>
      <div className="center-action"><Link className="button button-primary" href="/apply">BEGIN APPLICATION <span>→</span></Link></div>
    </section>
  </ArchiveShell>;
}
