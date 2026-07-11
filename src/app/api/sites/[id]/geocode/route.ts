import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resolveLocationInput } from "@/lib/geo";
import { logger } from "@/lib/logger";

type Body =
  | { mode?: "address" }
  | { mode: "link"; input: string }
  | { mode: "manual"; lat: number; lng: number };

async function parseBody(request: NextRequest): Promise<Body> {
  const text = await request.text();
  if (!text) return { mode: "address" };
  try {
    return JSON.parse(text) as Body;
  } catch {
    return { mode: "address" };
  }
}

async function geocodeAddress(address: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", address);
  url.searchParams.set("countrycodes", "lk");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": "skybell-site-tracker/1.0 (internal tool)" },
  });
  if (!res.ok) throw new Error("Geocoding failed");

  const results = (await res.json()) as { lat: string; lon: string }[];
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await parseBody(request);
  const mode = body.mode ?? "address";

  let coords: { lat: number; lng: number } | null = null;

  if (mode === "manual") {
    const { lat, lng } = body as { lat: number; lng: number };
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    coords = { lat, lng };
  } else if (mode === "link") {
    const { input } = body as { input: string };
    if (!input?.trim()) {
      return NextResponse.json({ error: "Paste a Google Maps link or coordinates" }, { status: 400 });
    }
    coords = await resolveLocationInput(input);
    if (!coords) {
      return NextResponse.json(
        {
          error:
            "Could not read coordinates from that. Try 'Share > Copy link' from Google Maps, or paste coordinates like 6.9271, 79.8612.",
        },
        { status: 400 }
      );
    }
  } else {
    if (!site.address) {
      return NextResponse.json({ error: "Site has no address" }, { status: 400 });
    }
    try {
      coords = await geocodeAddress(site.address);
    } catch (err) {
      logger.error({ err, siteId: id, address: site.address }, "geocoding request failed");
      return NextResponse.json({ error: "Geocoding service unreachable" }, { status: 502 });
    }
    if (!coords) {
      return NextResponse.json({ error: "No match found for this address" }, { status: 404 });
    }
  }

  const updated = await prisma.site.update({
    where: { id },
    data: { lat: coords.lat, lng: coords.lng, geocodedAt: new Date() },
  });

  return NextResponse.json({ site: updated });
}
