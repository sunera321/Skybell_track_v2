import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { saveUploadedFile } from "@/lib/storage";

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
  const label = formData.get("label");
  const durationRaw = formData.get("durationSeconds");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const { filename } = await saveUploadedFile(siteId, "voice-notes", file);
  const durationSeconds =
    typeof durationRaw === "string" && durationRaw ? Math.round(Number(durationRaw)) : null;

  const voiceNote = await prisma.voiceNote.create({
    data: {
      siteId,
      filename,
      durationSeconds,
      label: typeof label === "string" && label ? label : null,
      recordedById: session.user.id,
    },
  });

  return NextResponse.json({ voiceNote }, { status: 201 });
}
