import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { SiteForm } from "@/components/sites/SiteForm";

export default async function NewSitePage() {
  const [engineerRows, managerRows] = await Promise.all([
    prisma.site.findMany({
      distinct: ["engineer"],
      select: { engineer: true },
      orderBy: { engineer: "asc" },
    }),
    prisma.site.findMany({
      distinct: ["microbusinessManager"],
      select: { microbusinessManager: true },
      orderBy: { microbusinessManager: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-foreground">New site visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Site details</CardTitle>
        </CardHeader>
        <CardBody>
          <SiteForm
            engineers={engineerRows.map((e) => e.engineer)}
            managers={managerRows.map((m) => m.microbusinessManager)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
