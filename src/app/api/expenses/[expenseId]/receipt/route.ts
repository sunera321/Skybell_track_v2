import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { readExpenseReceipt, mimeTypeFor } from "@/lib/storage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { expenseId } = await params;
  const expense = await prisma.travelExpense.findUnique({ where: { id: expenseId } });
  if (!expense?.receiptFilename) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role !== "ADMIN" && expense.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await readExpenseReceipt(expenseId, expense.receiptFilename);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeTypeFor(expense.receiptFilename),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    logger.warn({ err, expenseId }, "receipt file read failed");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
