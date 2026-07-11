export type UploadKind = "photos" | "documents" | "voice-notes";

/** Public URL path served by the authenticated /api/files route. Safe to import from client components. */
export function fileUrl(siteId: string, kind: UploadKind, filename: string) {
  return `/api/files/${siteId}/${kind}/${encodeURIComponent(filename)}`;
}

/** Public URL path served by the authenticated /api/expenses/[expenseId]/receipt route. */
export function expenseReceiptUrl(expenseId: string) {
  return `/api/expenses/${expenseId}/receipt`;
}
