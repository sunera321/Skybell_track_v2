import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js bundles this module, which can change the effective `__dirname`
// the Prisma engine uses to resolve a relative sqlite `file:` path. Resolve
// it ourselves against `process.cwd()` (always the project root under
// `next dev`/`next start`) so it reliably points at `prisma/dev.db`.
function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  if (raw.startsWith("file:") && !path.isAbsolute(raw.slice("file:".length))) {
    const relative = raw.slice("file:".length);
    return `file:${path.resolve(process.cwd(), "prisma", relative)}`;
  }
  return raw;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
