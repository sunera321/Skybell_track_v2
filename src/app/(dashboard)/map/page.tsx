import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { MapView } from "@/components/map/MapView";
import { GeocodeAllButton } from "@/components/sites/GeocodeAllButton";

export default async function MapPage() {
  const sites = await prisma.site.findMany({
    orderBy: { customerName: "asc" },
    select: { id: true, customerName: true, address: true, lat: true, lng: true },
  });

  const located = sites.filter((s) => s.lat != null && s.lng != null) as (typeof sites[number] & {
    lat: number;
    lng: number;
  })[];
  const unlocated = sites.filter((s) => s.lat == null || s.lng == null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Site map</h1>
        <GeocodeAllButton siteIds={unlocated.map((s) => s.id)} />
      </div>

      <Card className="overflow-hidden">
        <MapView sites={located} height="520px" />
      </Card>

      {unlocated.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Not located yet ({unlocated.length})
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border text-sm">
            {unlocated.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-3 py-2">
                <Link href={`/sites/${s.id}`} className="text-foreground hover:text-brand-600">
                  {s.customerName}
                </Link>
                <span className="text-xs text-muted">{s.address}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
