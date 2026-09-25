import { questions } from "@/lib/questions";

const answerLimit = 4000;
const knownQuestionIds = new Set(questions.map(({ id }) => id));

export function validateAnswers(value: unknown): { answers?: Record<string, string>; error?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Application answers are required." };
  const source = value as Record<string, unknown>;
  const answers: Record<string, string> = {};
  for (const [id, answer] of Object.entries(source)) {
    if (!knownQuestionIds.has(id) || typeof answer !== "string" || answer.length > answerLimit) return { error: "One or more answers are invalid." };
    const question = questions.find((item) => item.id === id)!;
    const normalized = answer.trim();
    if (question.required && !normalized) return { error: "Please complete each required answer." };
    if (normalized && question.type === "select" && !question.options?.includes(normalized)) return { error: "One or more selected answers are invalid." };
    if (normalized && question.type === "scale" && (!/^\d$/.test(normalized) || Number(normalized) < 1 || Number(normalized) > 5)) return { error: "One or more scale answers are invalid." };
    if (normalized) answers[id] = normalized;
  }

  for (const question of questions) {
    if (question.required && !answers[question.id]) return { error: "Please complete each required answer." };
  }
  if (!/^\d{1,3}$/.test(answers.age || "") || Number(answers.age) < 18 || Number(answers.age) > 120) return { error: "Applicants must be at least 18." };
  return { answers };
}

export const revealFields = ["First name", "Nickname", "Instagram", "Discord", "Email", "Other contact method"] as const;
export const adminStatuses = ["RECEIVED", "UNDER REVIEW", "SHORTLISTED", "SELECTED", "NOT SELECTED", "CONTACT AVAILABLE"] as const;
export const adminRatingLabels = ["Chemistry", "Communication", "Humor", "Emotional fit", "Curiosity", "Overall interest"] as const;
