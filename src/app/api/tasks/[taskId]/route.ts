import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const body = await request.json();
  if (typeof body?.done !== "boolean") {
    return NextResponse.json({ error: "done must be a boolean" }, { status: 400 });
  }

  const task = await prisma.task
    .update({
      where: { id: taskId },
      data: { done: body.done, doneAt: body.done ? new Date() : null },
    })
    .catch((err) => {
      logger.warn({ err, taskId }, "task update failed");
      return null;
    });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await prisma.task
    .delete({ where: { id: taskId } })
    .catch((err) => logger.warn({ err, taskId }, "task delete failed"));

  return NextResponse.json({ ok: true });
}
