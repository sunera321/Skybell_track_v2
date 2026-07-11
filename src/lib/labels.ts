import type { JobStatus, QuotationStatus, DocType, Role } from "@/generated/prisma/client";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: "Pending",
  SITE_VISITED: "Site Visited",
  REVISIT_REQUIRED: "Revisit Required",
  POSTPONED: "Postponed",
  QUOTATION_SENT: "Quotation Sent",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const JOB_STATUS_TONE: Record<
  JobStatus,
  "neutral" | "brand" | "success" | "warning" | "danger"
> = {
  PENDING: "neutral",
  SITE_VISITED: "brand",
  REVISIT_REQUIRED: "warning",
  POSTPONED: "warning",
  QUOTATION_SENT: "brand",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  NOT_SENT: "Not Sent",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const QUOTATION_STATUS_TONE: Record<
  QuotationStatus,
  "neutral" | "brand" | "success" | "warning" | "danger"
> = {
  NOT_SENT: "neutral",
  SENT: "brand",
  APPROVED: "success",
  REJECTED: "danger",
};

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  QUOTATION: "Quotation",
  CONTRACT: "Contract",
  INVOICE: "Invoice",
  OTHER: "Other",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
};
