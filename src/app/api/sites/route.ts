import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { siteSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const engineer = searchParams.get("engineer")?.trim();
  const microbusinessManager = searchParams.get("microbusinessManager")?.trim();
  const jobStatus = searchParams.get("jobStatus")?.trim();
  const quotationStatus = searchParams.get("quotationStatus")?.trim();

  const where: Prisma.SiteWhereInput = {};
  if (q) {
    where.OR = [
      { customerName: { contains: q } },
      { address: { contains: q } },
      { scope: { contains: q } },
      { contactNumber: { contains: q } },
    ];
  }
  if (engineer) where.engineer = engineer;
  if (microbusinessManager) where.microbusinessManager = microbusinessManager;
  if (jobStatus) where.jobStatus = jobStatus as Prisma.EnumJobStatusFilter["equals"];
  if (quotationStatus)
    where.quotationStatus = quotationStatus as Prisma.EnumQuotationStatusFilter["equals"];

  const sites = await prisma.site.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { bomItems: true, photos: true, documents: true, voiceNotes: true } },
    },
  });

  return NextResponse.json({ sites });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = siteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const site = await prisma.site.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "site.create",
    entityType: "Site",
    entityId: site.id,
    metadata: { customerName: site.customerName },
  });

  return NextResponse.json({ site }, { status: 201 });
}
