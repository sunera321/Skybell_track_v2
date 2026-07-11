import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ bomItemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bomItemId } = await params;
  await prisma.bomItem.delete({ where: { id: bomItemId } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
