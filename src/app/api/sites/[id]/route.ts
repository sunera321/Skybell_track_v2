import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { siteSchema } from "@/lib/validation";
import { deleteSiteUploads } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      bomItems: { orderBy: { createdAt: "asc" } },
      photos: { orderBy: { uploadedAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      documents: { orderBy: { uploadedAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      voiceNotes: { orderBy: { recordedAt: "desc" }, include: { recordedBy: { select: { name: true } } } },
      travelExpenses: { orderBy: { date: "desc" } },
      tasks: { orderBy: [{ done: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ site });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = siteSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.site.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Address changed — the cached geocode is no longer trustworthy.
  const clearGeocode =
    parsed.data.address !== undefined && parsed.data.address !== existing.address;

  const site = await prisma.site.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(clearGeocode ? { lat: null, lng: null, geocodedAt: null } : {}),
    },
  });

  if (parsed.data.jobStatus !== undefined && parsed.data.jobStatus !== existing.jobStatus) {
    await logAudit({
      userId: session.user.id,
      action: "site.jobStatus.change",
      entityType: "Site",
      entityId: id,
      metadata: { from: existing.jobStatus, to: parsed.data.jobStatus },
    });
  }

  if (
    parsed.data.quotationStatus !== undefined &&
    parsed.data.quotationStatus !== existing.quotationStatus
  ) {
    await logAudit({
      userId: session.user.id,
      action: "site.quotationStatus.change",
      entityType: "Site",
      entityId: id,
      metadata: { from: existing.quotationStatus, to: parsed.data.quotationStatus },
    });
  }

  return NextResponse.json({ site });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.site.findUnique({ where: { id } });

  await prisma.site
    .delete({ where: { id } })
    .catch((err) => logger.warn({ err, siteId: id }, "site delete failed"));
  await deleteSiteUploads(id);

  if (existing) {
    await logAudit({
      userId: session.user.id,
      action: "site.delete",
      entityType: "Site",
      entityId: id,
      metadata: { customerName: existing.customerName },
    });
  }

  return NextResponse.json({ ok: true });
}
