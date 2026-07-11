import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ bomItemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bomItemId } = await params;
  await prisma.bomItem
    .delete({ where: { id: bomItemId } })
    .catch((err) => logger.warn({ err, bomItemId }, "bom item delete failed"));

  return NextResponse.json({ ok: true });
}
