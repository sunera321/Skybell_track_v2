import Link from "next/link";
import { Plus, Download, MapPin, Image as ImageIcon, FileText, Mic } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SiteFilters } from "@/components/sites/SiteFilters";
import { JOB_STATUS_LABELS, JOB_STATUS_TONE, QUOTATION_STATUS_LABELS, QUOTATION_STATUS_TONE } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const engineer = typeof sp.engineer === "string" ? sp.engineer : "";
  const microbusinessManager =
    typeof sp.microbusinessManager === "string" ? sp.microbusinessManager : "";
  const jobStatus = typeof sp.jobStatus === "string" ? sp.jobStatus : "";
  const quotationStatus = typeof sp.quotationStatus === "string" ? sp.quotationStatus : "";

  const where: Prisma.SiteWhereInput = {};
  if (q) {
    where.OR = [
      { customerName: { contains: q } },
      { address: { contains: q } },
      { scope: { contains: q } },
    ];
  }
  if (engineer) where.engineer = engineer;
  if (microbusinessManager) where.microbusinessManager = microbusinessManager;
  if (jobStatus) where.jobStatus = jobStatus as Prisma.EnumJobStatusFilter["equals"];
  if (quotationStatus)
    where.quotationStatus = quotationStatus as Prisma.EnumQuotationStatusFilter["equals"];

  const [sites, engineerRows, managerRows] = await Promise.all([
    prisma.site.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { bomItems: true, photos: true, documents: true, voiceNotes: true } },
      },
    }),
    prisma.site.findMany({ distinct: ["engineer"], select: { engineer: true }, orderBy: { engineer: "asc" } }),
    prisma.site.findMany({
      distinct: ["microbusinessManager"],
      select: { microbusinessManager: true },
      orderBy: { microbusinessManager: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Sites</h1>
        <div className="flex gap-2">
          <LinkButton href="/api/export" variant="secondary" size="sm">
            <Download size={16} />
            Export
          </LinkButton>
          <LinkButton href="/sites/new" size="sm">
            <Plus size={16} />
            New site
          </LinkButton>
        </div>
      </div>

      <SiteFilters
        engineers={engineerRows.map((e) => e.engineer)}
        managers={managerRows.map((m) => m.microbusinessManager)}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.02] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Engineer</th>
                <th className="px-4 py-3 font-medium">Manager</th>
                <th className="px-4 py-3 font-medium">Job status</th>
                <th className="px-4 py-3 font-medium">Quotation</th>
                <th className="px-4 py-3 font-medium">Attachments</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-black/[.02]">
                  <td className="px-4 py-3">
                    <Link href={`/sites/${site.id}`} className="font-medium text-foreground hover:text-brand-600">
                      {site.customerName}
                    </Link>
                    <div className="max-w-xs truncate text-xs text-muted">{site.address}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{site.engineer}</td>
                  <td className="px-4 py-3 text-muted">{site.microbusinessManager}</td>
                  <td className="px-4 py-3">
                    <Badge tone={JOB_STATUS_TONE[site.jobStatus]}>
                      {JOB_STATUS_LABELS[site.jobStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={QUOTATION_STATUS_TONE[site.quotationStatus]}>
                      {QUOTATION_STATUS_LABELS[site.quotationStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <FileText size={13} /> {site._count.bomItems}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon size={13} /> {site._count.photos}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mic size={13} /> {site._count.voiceNotes}
                      </span>
                      {site.lat != null && (
                        <span className="flex items-center gap-1 text-brand-600">
                          <MapPin size={13} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(site.updatedAt)}
                  </td>
                </tr>
              ))}
              {sites.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No sites match these filters.
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
