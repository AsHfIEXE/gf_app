export type ApplicationStatus = "RECEIVED" | "UNDER REVIEW" | "SHORTLISTED" | "SELECTED" | "NOT SELECTED" | "CONTACT AVAILABLE";

export type ApplicationRecord = {
  id: string;
  reportId: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  adminNotes: string;
  ratings: Record<string, number>;
  revealedContact?: { fields: string[]; message: string; revealedAt: string };
};

export type ApplicantStatusRecord = Pick<ApplicationRecord, "reportId" | "status" | "published" | "createdAt">;

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function statusLabel(status: ApplicationStatus) {
  return status.replaceAll("_", " ");
}
