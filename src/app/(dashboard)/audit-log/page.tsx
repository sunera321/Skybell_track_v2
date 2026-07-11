import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { JOB_STATUS_LABELS, QUOTATION_STATUS_LABELS } from "@/lib/labels";
import type { JobStatus, QuotationStatus } from "@/generated/prisma/client";

const ACTION_LABELS: Record<string, string> = {
  "site.create": "Created site",
  "site.delete": "Deleted site",
  "site.jobStatus.change": "Changed job status",
  "site.quotationStatus.change": "Changed quotation status",
  "user.create": "Added team member",
  "user.delete": "Removed team member",
};

function describeMetadata(action: string, metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;

  if (action === "site.jobStatus.change" && m.from && m.to) {
    return `${JOB_STATUS_LABELS[m.from as JobStatus] ?? m.from} → ${JOB_STATUS_LABELS[m.to as JobStatus] ?? m.to}`;
  }
  if (action === "site.quotationStatus.change" && m.from && m.to) {
    return `${QUOTATION_STATUS_LABELS[m.from as QuotationStatus] ?? m.from} → ${QUOTATION_STATUS_LABELS[m.to as QuotationStatus] ?? m.to}`;
  }
  if (typeof m.customerName === "string") return m.customerName;
  if (typeof m.email === "string") return m.email;
  return null;
}

export default async function AuditLogPage() {
  await requireAdmin();

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Audit Log</h1>
        <Link href="/team" className="text-sm font-medium text-brand-700 hover:underline">
          Back to Team
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.02] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-black/[.02]">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {entry.user?.name ?? entry.user?.email ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{ACTION_LABELS[entry.action] ?? entry.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {describeMetadata(entry.action, entry.metadata)}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    No activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
