import "dotenv/config";
import path from "node:path";
import ExcelJS from "exceljs";
import { prisma } from "../src/lib/prisma";
import type { JobStatus, QuotationStatus } from "../src/generated/prisma/client";

const SOURCE_FILE = path.join(
  process.cwd(),
  "data/seed/Telecom Site Inspection details.xlsx"
);

function cellText(ws: ExcelJS.Worksheet, col: string, row: number): string {
  const cell = ws.getCell(`${col}${row}`);
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && "richText" in v) {
    return (v as { richText: { text: string }[] }).richText
      .map((t) => t.text)
      .join("");
  }
  return String(v).trim();
}

function formatPhone(raw: string): string | null {
  if (!raw) return null;
  // Plain 9-digit number lost its leading 0 when Excel stored it numerically
  if (/^\d{9}$/.test(raw)) return `0${raw}`;
  return raw;
}

function guessJobStatus(raw: string): JobStatus {
  const s = raw.toLowerCase();
  if (!s) return "PENDING";
  if (s.includes("revisit")) return "REVISIT_REQUIRED";
  if (s.includes("postpon")) return "POSTPONED";
  if (s.includes("visit")) return "SITE_VISITED";
  if (s.includes("cancel")) return "CANCELLED";
  if (s.includes("complet")) return "COMPLETED";
  return "PENDING";
}

function guessQuotationStatus(raw: string): QuotationStatus {
  const s = raw.toLowerCase();
  if (s.includes("approved")) return "APPROVED";
  if (s.includes("reject")) return "REJECTED";
  if (s.includes("sent")) return "SENT";
  return "NOT_SENT";
}

interface ImportedSite {
  id: string;
  customerName: string;
}

async function importEngineerSheet(
  ws: ExcelJS.Worksheet,
  sheetName: string,
  adminUserId: string
): Promise<ImportedSite[]> {
  const created: ImportedSite[] = [];
  let row = 3;
  let blankStreak = 0;

  while (blankStreak < 3) {
    const engineer = cellText(ws, "A", row) || sheetName;
    const customerName = cellText(ws, "B", row);
    const location = cellText(ws, "C", row);

    if (!customerName && !location) {
      blankStreak++;
      row++;
      continue;
    }
    blankStreak = 0;

    const contactRaw = cellText(ws, "D", row);
    const scope = cellText(ws, "E", row);
    const jobStatusRaw = cellText(ws, "F", row);
    const solutionLochana = cellText(ws, "G", row);
    const solutionBuddika = cellText(ws, "H", row);
    const quotationRaw = cellText(ws, "I", row);

    const site = await prisma.site.create({
      data: {
        engineer,
        microbusinessManager: "Unassigned",
        customerName: customerName || "(unnamed customer)",
        address: location || "",
        contactNumber: formatPhone(contactRaw),
        scope: scope || null,
        jobStatus: guessJobStatus(jobStatusRaw),
        jobStatusNote: jobStatusRaw || null,
        quotationStatus: guessQuotationStatus(quotationRaw),
        solutionDetailsLochana: solutionLochana || null,
        solutionDetailsBuddika: solutionBuddika || null,
        createdById: adminUserId,
      },
    });

    created.push({ id: site.id, customerName: site.customerName });
    row++;
  }

  return created;
}

interface RawBomRow {
  category: string;
  item: string;
  quantity: string;
}

function parseCategoryBlock(
  ws: ExcelJS.Worksheet,
  catCol: string,
  itemCol: string,
  qtyCol: string,
  rowStart: number,
  rowEnd: number
): RawBomRow[] {
  const rows: RawBomRow[] = [];
  let lastCategory = "General";

  for (let r = rowStart; r <= rowEnd; r++) {
    const catRaw = cellText(ws, catCol, r);
    const itemRaw = cellText(ws, itemCol, r);
    const qtyRaw = cellText(ws, qtyCol, r);

    if (catRaw) lastCategory = catRaw;
    if (!itemRaw || itemRaw.toLowerCase() === "item") continue;

    rows.push({ category: lastCategory, item: itemRaw, quantity: qtyRaw || "-" });
  }

  return rows;
}

function parseWiredWirelessBlock(
  ws: ExcelJS.Worksheet,
  itemCol: string,
  wiredCol: string,
  wirelessCol: string,
  rowStart: number,
  rowEnd: number
): RawBomRow[] {
  const rows: RawBomRow[] = [];

  for (let r = rowStart; r <= rowEnd; r++) {
    const itemRaw = cellText(ws, itemCol, r);
    if (!itemRaw || itemRaw.toLowerCase() === "item") continue;

    const wired = cellText(ws, wiredCol, r);
    const wireless = cellText(ws, wirelessCol, r);

    if (wired && wired.toLowerCase() !== "not required") {
      rows.push({ category: "Wired PABX", item: itemRaw, quantity: wired });
    }
    if (wireless && wireless.toLowerCase() !== "not required") {
      rows.push({ category: "Wireless IP PABX", item: itemRaw, quantity: wireless });
    }
  }

  return rows;
}

function findSite(sites: ImportedSite[], blockName: string): ImportedSite | undefined {
  const needle = blockName.toLowerCase();
  return sites.find(
    (s) =>
      s.customerName.toLowerCase().includes(needle) ||
      needle.includes(s.customerName.toLowerCase())
  );
}

async function importBomSheet(ws: ExcelJS.Worksheet, sites: ImportedSite[]) {
  const blocks: { siteHeaderCell: string; rows: RawBomRow[] }[] = [
    {
      siteHeaderCell: "A1",
      rows: parseCategoryBlock(ws, "A", "B", "C", 3, 12),
    },
    {
      siteHeaderCell: "E1",
      rows: parseWiredWirelessBlock(ws, "E", "F", "G", 3, 14),
    },
    {
      siteHeaderCell: "I1",
      rows: parseCategoryBlock(ws, "I", "J", "K", 3, 20),
    },
    {
      siteHeaderCell: "M1",
      rows: parseCategoryBlock(ws, "M", "N", "O", 3, 11),
    },
  ];

  let itemsCreated = 0;
  const unmatched: string[] = [];

  for (const block of blocks) {
    const blockName = cellText(ws, block.siteHeaderCell.slice(0, 1), Number(block.siteHeaderCell.slice(1)));
    if (!blockName) continue;

    const site = findSite(sites, blockName);
    if (!site) {
      unmatched.push(blockName);
      continue;
    }

    for (const row of block.rows) {
      await prisma.bomItem.create({
        data: {
          siteId: site.id,
          category: row.category,
          item: row.item,
          quantity: row.quantity,
        },
      });
      itemsCreated++;
    }
  }

  return { itemsCreated, unmatched };
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@skybell.lk").toLowerCase().trim();
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error(
      `No admin user found for ${adminEmail}. Run "npm run seed:admin" first.`
    );
    process.exit(1);
  }

  const existingSiteCount = await prisma.site.count();
  if (existingSiteCount > 0) {
    console.log(
      `Database already has ${existingSiteCount} site(s). Skipping import to avoid duplicates.`
    );
    console.log('If you want to re-import, clear the Site table first.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_FILE);

  const allSites: ImportedSite[] = [];

  for (const sheetName of ["Lakmini", "Silshara"]) {
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`Sheet "${sheetName}" not found, skipping.`);
      continue;
    }
    const sites = await importEngineerSheet(ws, sheetName, admin.id);
    console.log(`Imported ${sites.length} sites from "${sheetName}"`);
    allSites.push(...sites);
  }

  const bomSheet = workbook.getWorksheet("Site Inspection details");
  let bomSummary = { itemsCreated: 0, unmatched: [] as string[] };
  if (bomSheet) {
    bomSummary = await importBomSheet(bomSheet, allSites);
  }

  console.log("\n--- Import summary ---");
  console.log(`Sites created: ${allSites.length}`);
  console.log(`BOM line items created: ${bomSummary.itemsCreated}`);
  if (bomSummary.unmatched.length) {
    console.log(
      `BOM blocks that could not be matched to a site (add manually via the UI): ${bomSummary.unmatched.join(", ")}`
    );
  }
  console.log(
    "\nReview each site's BOM tab in the app — the source spreadsheet layout was irregular, so a manual spot-check is recommended."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
