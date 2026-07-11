/*
  Warnings:

  - Added the required column `microbusinessManager` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TravelExpense" ADD COLUMN "receiptFilename" TEXT;
ALTER TABLE "TravelExpense" ADD COLUMN "receiptOriginalName" TEXT;

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineer" TEXT NOT NULL,
    "microbusinessManager" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT,
    "scope" TEXT,
    "jobStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "jobStatusNote" TEXT,
    "quotationStatus" TEXT NOT NULL DEFAULT 'NOT_SENT',
    "solutionDetailsLochana" TEXT,
    "solutionDetailsBuddika" TEXT,
    "lat" REAL,
    "lng" REAL,
    "geocodedAt" DATETIME,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Site_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("address", "contactNumber", "createdAt", "createdById", "customerName", "engineer", "microbusinessManager", "geocodedAt", "id", "jobStatus", "jobStatusNote", "lat", "lng", "quotationStatus", "scope", "solutionDetailsBuddika", "solutionDetailsLochana", "updatedAt") SELECT "address", "contactNumber", "createdAt", "createdById", "customerName", "engineer", 'Unassigned', "geocodedAt", "id", "jobStatus", "jobStatusNote", "lat", "lng", "quotationStatus", "scope", "solutionDetailsBuddika", "solutionDetailsLochana", "updatedAt" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE INDEX "Site_jobStatus_idx" ON "Site"("jobStatus");
CREATE INDEX "Site_engineer_idx" ON "Site"("engineer");
CREATE INDEX "Site_microbusinessManager_idx" ON "Site"("microbusinessManager");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Task_siteId_idx" ON "Task"("siteId");
