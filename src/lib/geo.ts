export interface LatLng {
  lat: number;
  lng: number;
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

const COORD_ONLY = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

// Checked in priority order: "!3d..!4d.." is the precise pinned place (used on
// Google Maps place links); "?q=" is an explicit query point; "@lat,lng" is
// just the map viewport center, which is usually close enough as a fallback.
const URL_PATTERNS = [
  /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
  /[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
  /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
];

function extractFromText(text: string): LatLng | null {
  for (const re of URL_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (isValidCoord(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

/**
 * Accepts whatever a field engineer is likely to paste: a raw "lat,lng" pair,
 * a full Google Maps URL, or a shortened share link (maps.app.goo.gl / goo.gl/maps)
 * which gets resolved via its redirect before parsing.
 */
export async function resolveLocationInput(input: string): Promise<LatLng | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const coordMatch = trimmed.match(COORD_ONLY);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (isValidCoord(lat, lng)) return { lat, lng };
  }

  const direct = extractFromText(safeDecode(trimmed));
  if (direct) return direct;

  if (!/^https?:\/\//i.test(trimmed)) return null;

  try {
    const res = await fetch(trimmed, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; skybell-site-tracker/1.0; +https://skybell.lk)",
      },
    });

    const finalUrl = res.url || trimmed;
    const fromUrl = extractFromText(safeDecode(finalUrl));
    if (fromUrl) return fromUrl;

    // Some redirect chains land on a page where the coordinates only show up
    // in the HTML body (e.g. embedded JS state) rather than the final URL.
    const body = await res.text();
    return extractFromText(safeDecode(body.slice(0, 20000)));
  } catch {
    return null;
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
