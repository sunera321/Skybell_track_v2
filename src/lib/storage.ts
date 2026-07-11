import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink, rm, readFile } from "node:fs/promises";
import type { UploadKind } from "./file-url";

export type { UploadKind } from "./file-url";
export { fileUrl } from "./file-url";

function uploadsRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./uploads");
}

export function siteUploadDir(siteId: string, kind: UploadKind) {
  return path.join(uploadsRoot(), siteId, kind);
}

export function absoluteFilePath(siteId: string, kind: UploadKind, filename: string) {
  return path.join(siteUploadDir(siteId, kind), filename);
}

export async function saveUploadedFile(
  siteId: string,
  kind: UploadKind,
  file: File
): Promise<{ filename: string; originalName: string }> {
  const dir = siteUploadDir(siteId, kind);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { filename, originalName: file.name || filename };
}

export async function deleteUploadedFile(siteId: string, kind: UploadKind, filename: string) {
  await unlink(absoluteFilePath(siteId, kind, filename)).catch(() => null);
}

/** Removes every uploaded file for a site. Call when the site itself is deleted. */
export async function deleteSiteUploads(siteId: string) {
  await rm(path.join(uploadsRoot(), siteId), { recursive: true, force: true }).catch(() => null);
}

function expenseUploadDir(expenseId: string) {
  return path.join(uploadsRoot(), "expenses", expenseId);
}

function absoluteExpenseFilePath(expenseId: string, filename: string) {
  return path.join(expenseUploadDir(expenseId), filename);
}

export async function saveExpenseReceipt(
  expenseId: string,
  file: File
): Promise<{ filename: string; originalName: string }> {
  const dir = expenseUploadDir(expenseId);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { filename, originalName: file.name || filename };
}

export async function readExpenseReceipt(expenseId: string, filename: string) {
  return readFile(absoluteExpenseFilePath(expenseId, filename));
}

/** Removes every uploaded file for an expense. Call when the expense itself is deleted. */
export async function deleteExpenseUploads(expenseId: string) {
  await rm(expenseUploadDir(expenseId), { recursive: true, force: true }).catch(() => null);
}

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".webm": "audio/webm",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
};

export function mimeTypeFor(filename: string) {
  return MIME_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
}
