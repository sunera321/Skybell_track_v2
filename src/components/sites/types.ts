import type { Prisma } from "@/generated/prisma/client";

export type SiteWithRelations = Prisma.SiteGetPayload<{
  include: {
    bomItems: true;
    photos: { include: { uploadedBy: { select: { name: true } } } };
    documents: { include: { uploadedBy: { select: { name: true } } } };
    voiceNotes: { include: { recordedBy: { select: { name: true } } } };
    travelExpenses: true;
    tasks: true;
  };
}>;
