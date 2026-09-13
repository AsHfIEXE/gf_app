export type ApplicationStatus = "RECEIVED" | "UNDER REVIEW" | "SHORTLISTED" | "SELECTED" | "NOT SELECTED" | "CONTACT AVAILABLE";

export type ApplicationRecord = {
  id: string;
  reportId: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes: string;
  ratings: Record<string, number>;
  revealedContact?: { fields: string[]; message: string; revealedAt: string };
};

const KEY = "gf-archive-applications";
const LAST_ID_KEY = "gf-archive-last-report-id";

export function createReportId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(8);
  crypto.getRandomValues(values);
  const token = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `GF-${token.slice(0, 4)}-${token.slice(4)}`;
}

export function getApplications(): ApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as ApplicationRecord[];
  } catch {
    return [];
  }
}

export function saveApplications(applications: ApplicationRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(applications));
}

export function saveApplication(application: ApplicationRecord) {
  const applications = getApplications();
  saveApplications([application, ...applications.filter(({ id }) => id !== application.id)]);
}

export function findApplication(reportId: string) {
  return getApplications().find((application) => application.reportId.toUpperCase() === reportId.trim().toUpperCase());
}

export function setLastReportId(reportId: string) {
  localStorage.setItem(LAST_ID_KEY, reportId);
}

export function getLastReportId() {
  return typeof window === "undefined" ? null : localStorage.getItem(LAST_ID_KEY);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function statusLabel(status: ApplicationStatus) {
  return status.replaceAll("_", " ");
}
