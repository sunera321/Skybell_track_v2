import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { SiteForm } from "@/components/sites/SiteForm";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [site, engineerRows, managerRows] = await Promise.all([
    prisma.site.findUnique({ where: { id } }),
    prisma.site.findMany({ distinct: ["engineer"], select: { engineer: true }, orderBy: { engineer: "asc" } }),
    prisma.site.findMany({
      distinct: ["microbusinessManager"],
      select: { microbusinessManager: true },
      orderBy: { microbusinessManager: "asc" },
    }),
  ]);

  if (!site) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Edit site</h1>
      <Card>
        <CardHeader>
          <CardTitle>{site.customerName}</CardTitle>
        </CardHeader>
        <CardBody>
          <SiteForm
            site={site}
            engineers={engineerRows.map((e) => e.engineer)}
            managers={managerRows.map((m) => m.microbusinessManager)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
