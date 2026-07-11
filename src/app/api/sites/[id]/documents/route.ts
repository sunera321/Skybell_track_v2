import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { saveUploadedFile } from "@/lib/storage";
import { DOC_TYPE_VALUES } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: siteId } = await params;
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  const docTypeRaw = formData.get("docType");
  const docType = DOC_TYPE_VALUES.includes(docTypeRaw as (typeof DOC_TYPE_VALUES)[number])
    ? (docTypeRaw as (typeof DOC_TYPE_VALUES)[number])
    : "OTHER";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const { filename, originalName } = await saveUploadedFile(siteId, "documents", file);

  const document = await prisma.document.create({
    data: {
      siteId,
      filename,
      originalName,
      docType,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
