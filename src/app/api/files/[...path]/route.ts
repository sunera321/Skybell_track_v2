import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { absoluteFilePath, mimeTypeFor, type UploadKind } from "@/lib/storage";

export const runtime = "nodejs";

const VALID_KINDS: UploadKind[] = ["photos", "documents", "voice-notes"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = await params;
  const [siteId, kind, ...rest] = segments.path;
  const filename = path.basename(decodeURIComponent(rest.join("/")));

  if (!siteId || !kind || !filename || !VALID_KINDS.includes(kind as UploadKind)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = absoluteFilePath(siteId, kind as UploadKind, filename);
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeTypeFor(filename),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
