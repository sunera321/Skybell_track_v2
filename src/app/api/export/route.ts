import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JOB_STATUS_LABELS, QUOTATION_STATUS_LABELS } from "@/lib/labels";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await prisma.site.findMany({
    orderBy: [{ engineer: "asc" }, { customerName: "asc" }],
    include: { bomItems: true },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sites");

  sheet.columns = [
    { header: "Engineer", key: "engineer", width: 16 },
    { header: "Microbusiness Manager", key: "microbusinessManager", width: 20 },
    { header: "Customer Name", key: "customerName", width: 30 },
    { header: "Address", key: "address", width: 40 },
    { header: "Contact Number", key: "contactNumber", width: 20 },
    { header: "Scope", key: "scope", width: 30 },
    { header: "Job Status", key: "jobStatus", width: 18 },
    { header: "Job Status Note", key: "jobStatusNote", width: 30 },
    { header: "Quotation Status", key: "quotationStatus", width: 16 },
    { header: "Solution Details - Lochana", key: "solutionDetailsLochana", width: 40 },
    { header: "Solution Details - Buddika", key: "solutionDetailsBuddika", width: 40 },
    { header: "BOM Items", key: "bomSummary", width: 60 },
    { header: "Updated", key: "updatedAt", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const site of sites) {
    sheet.addRow({
      engineer: site.engineer,
      microbusinessManager: site.microbusinessManager,
      customerName: site.customerName,
      address: site.address,
      contactNumber: site.contactNumber ?? "",
      scope: site.scope ?? "",
      jobStatus: JOB_STATUS_LABELS[site.jobStatus],
      jobStatusNote: site.jobStatusNote ?? "",
      quotationStatus: QUOTATION_STATUS_LABELS[site.quotationStatus],
      solutionDetailsLochana: site.solutionDetailsLochana ?? "",
      solutionDetailsBuddika: site.solutionDetailsBuddika ?? "",
      bomSummary: site.bomItems
        .map((b) => `${b.category}: ${b.item} x ${b.quantity}`)
        .join("; "),
      updatedAt: site.updatedAt.toISOString().slice(0, 10),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="skybell-sites-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
