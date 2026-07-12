import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteExpenseUploads } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { expenseId } = await params;
  const expense = await prisma.travelExpense.findUnique({ where: { id: expenseId } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "ADMIN" && expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.travelExpense
    .delete({ where: { id: expenseId } })
    .catch((err) => logger.warn({ err, expenseId }, "expense delete failed"));
  await deleteExpenseUploads(expenseId);

  return NextResponse.json({ ok: true });
}
