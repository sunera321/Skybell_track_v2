import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteUploadedFile } from "@/lib/storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ voiceNoteId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { voiceNoteId } = await params;
  const voiceNote = await prisma.voiceNote.findUnique({ where: { id: voiceNoteId } });
  if (!voiceNote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.voiceNote.delete({ where: { id: voiceNoteId } });
  await deleteUploadedFile(voiceNote.siteId, "voice-notes", voiceNote.filename);

  return NextResponse.json({ ok: true });
}
