import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteExpenseUploads } from "@/lib/storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { expenseId } = await params;
  await prisma.travelExpense.delete({ where: { id: expenseId } }).catch(() => null);
  await deleteExpenseUploads(expenseId);

  return NextResponse.json({ ok: true });
}
