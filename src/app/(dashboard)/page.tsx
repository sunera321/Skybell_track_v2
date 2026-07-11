import Link from "next/link";
import { Building2, MapPin, Receipt, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapView } from "@/components/map/MapView";
import { JOB_STATUS_LABELS, JOB_STATUS_TONE } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();

  const [totalSites, byStatus, recentSites, locatedSites, expenseTotal, bomCount] =
    await Promise.all([
      prisma.site.count(),
      prisma.site.groupBy({ by: ["jobStatus"], _count: { _all: true } }),
      prisma.site.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, customerName: true, engineer: true, jobStatus: true, updatedAt: true },
      }),
      prisma.site.findMany({
        where: { lat: { not: null }, lng: { not: null } },
        select: { id: true, customerName: true, address: true, lat: true, lng: true },
      }),
      prisma.travelExpense.aggregate({ _sum: { amount: true } }),
      prisma.bomItem.count(),
    ]);

  const statusMap = new Map<string, number>(
    byStatus.map((s) => [s.jobStatus, s._count._all])
  );
  const mappableSites = locatedSites.filter(
    (s): s is typeof s & { lat: number; lng: number } => s.lat != null && s.lng != null
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-foreground">
        Welcome back, {user.name?.split(" ")[0] ?? "there"}
      </h1>
      <p className="mb-5 text-sm text-muted">Here&apos;s what&apos;s happening across Skybell site visits.</p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label="Total sites" value={totalSites} href="/sites" />
        <StatCard
          icon={MapPin}
          label="Site visited"
          value={statusMap.get("SITE_VISITED") ?? 0}
          href="/sites?jobStatus=SITE_VISITED"
        />
        <StatCard
          icon={Receipt}
          label="Travel expenses"
          value={formatCurrency(expenseTotal._sum.amount ?? 0)}
          href="/expenses"
        />
        <StatCard icon={FileText} label="BOM line items" value={bomCount} href="/sites" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recently updated sites</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {recentSites.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link href={`/sites/${s.id}`} className="text-sm font-medium text-foreground hover:text-brand-600">
                      {s.customerName}
                    </Link>
                    <p className="text-xs text-muted">
                      {s.engineer} · {formatDate(s.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={JOB_STATUS_TONE[s.jobStatus]}>{JOB_STATUS_LABELS[s.jobStatus]}</Badge>
                </li>
              ))}
              {recentSites.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted">No sites yet.</li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>Site map</CardTitle>
          </CardHeader>
          <MapView sites={mappableSites} height="320px" />
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Job status breakdown</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(JOB_STATUS_LABELS).map(([key, label]) => (
            <Card key={key} className="p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{statusMap.get(key) ?? 0}</p>
              <p className="text-xs text-muted">{label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-4 transition-colors hover:border-brand-500/40">
        <Icon size={18} className="mb-2 text-brand-500" />
        <p className="text-lg font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </Card>
    </Link>
  );
}
