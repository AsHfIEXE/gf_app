"use client";

import type { ChangeEvent } from "react";
import type { Question } from "@/lib/questions";

type Props = { question: Question; value: string; onChange: (value: string) => void; showError: boolean };

export function QuestionInput({ question, value, onChange, showError }: Props) {
  if (question.type === "select") {
    return <div className="choice-list" role="radiogroup" aria-label={question.title}>
      {question.options?.map((option, index) => <label className={`choice ${value === option ? "is-selected" : ""}`} key={option}>
        <input type="radio" name={question.id} value={option} checked={value === option} onChange={() => onChange(option)} />
        <span className="choice-index">0{index + 1}</span><span>{option}</span>
      </label>)}
      {showError && <p className="field-error">Choose the answer that fits best.</p>}
    </div>;
  }

  if (question.type === "scale") {
    const numeric = value ? Number(value) : 3;
    return <div className="scale-control">
      <div className="scale-labels"><span>{question.lowLabel}</span><span>{question.highLabel}</span></div>
      <input aria-label={question.title} type="range" min="1" max="5" step="1" value={numeric} onChange={(event) => onChange(event.target.value)} />
      <div className="scale-steps"><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span></div>
    </div>;
  }

  const common = { value, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), placeholder: question.id === "age" ? "18 or older" : question.type === "textarea" ? "Write whatever is true..." : "Your answer..." };
  if (question.id === "age") {
    return <div>
      <input className="answer-input" autoFocus type="number" min={18} max={120} step={1} inputMode="numeric" aria-label={question.title} {...common} />
      {showError && <p className="field-error">Enter an age from 18 to 120.</p>}
    </div>;
  }
  return <div>
    {question.type === "textarea" ? <textarea className="answer-textarea" rows={7} autoFocus {...common} /> : <input className="answer-input" autoFocus {...common} />}
    {showError && <p className="field-error">This is one of the few required answers.</p>}
  </div>;
}
