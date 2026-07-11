import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { travelExpenseSchema } from "@/lib/validation";
import { saveExpenseReceipt } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.travelExpense.findMany({
    orderBy: { date: "desc" },
    include: { site: { select: { customerName: true } }, user: { select: { name: true } } },
  });

  return NextResponse.json({ expenses });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const parsed = travelExpenseSchema.safeParse({
    siteId: formData.get("siteId"),
    date: formData.get("date"),
    purpose: formData.get("purpose"),
    amount: formData.get("amount"),
    distanceKm: formData.get("distanceKm") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { siteId, date, purpose, amount, distanceKm } = parsed.data;

  let expense = await prisma.travelExpense.create({
    data: {
      siteId: siteId || null,
      date: new Date(date),
      purpose,
      amount,
      distanceKm: distanceKm ?? null,
      userId: session.user.id,
    },
  });

  const receipt = formData.get("receipt");
  if (receipt instanceof File && receipt.size > 0) {
    const { filename, originalName } = await saveExpenseReceipt(expense.id, receipt);
    expense = await prisma.travelExpense.update({
      where: { id: expense.id },
      data: { receiptFilename: filename, receiptOriginalName: originalName },
    });
  }

  return NextResponse.json({ expense }, { status: 201 });
}
