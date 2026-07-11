import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { userId } = await params;
  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });

  await prisma.user
    .delete({ where: { id: userId } })
    .catch((err) => logger.warn({ err, userId }, "user delete failed"));

  if (existing) {
    await logAudit({
      userId: session.user.id,
      action: "user.delete",
      entityType: "User",
      entityId: userId,
      metadata: { email: existing.email },
    });
  }

  return NextResponse.json({ ok: true });
}
