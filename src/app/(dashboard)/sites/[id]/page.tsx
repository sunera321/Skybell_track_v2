import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/Badge";
import { SiteDetailTabs } from "@/components/sites/SiteDetailTabs";
import { SiteHeaderActions } from "@/components/sites/SiteHeaderActions";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_TONE,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_TONE,
} from "@/lib/labels";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      bomItems: { orderBy: { createdAt: "asc" } },
      photos: {
        orderBy: { uploadedAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
      voiceNotes: {
        orderBy: { recordedAt: "desc" },
        include: { recordedBy: { select: { name: true } } },
      },
      travelExpenses: { orderBy: { date: "desc" } },
      tasks: { orderBy: [{ done: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!site) notFound();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{site.customerName}</h1>
            <Badge tone={JOB_STATUS_TONE[site.jobStatus]}>{JOB_STATUS_LABELS[site.jobStatus]}</Badge>
            <Badge tone={QUOTATION_STATUS_TONE[site.quotationStatus]}>
              {QUOTATION_STATUS_LABELS[site.quotationStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted">{site.address}</p>
        </div>
        <SiteHeaderActions siteId={site.id} canDelete={user.role === "ADMIN"} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <SiteDetailTabs site={site} />
      </div>
    </div>
  );
}
