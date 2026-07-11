"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Link2, Crosshair, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { MapView } from "@/components/map/MapView";
import { formatDateTime } from "@/lib/utils";
import type { SiteWithRelations } from "./types";

type Mode = "address" | "link" | "manual";

export function MapTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [showAdjust, setShowAdjust] = useState(site.lat == null);
  const [manualPick, setManualPick] = useState<{ lat: number; lng: number } | null>(null);

  async function submit(mode: Mode, body?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/sites/${site.id}/geocode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, ...body }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not set the location.");
      return;
    }
    setLinkInput("");
    setManualPick(null);
    setShowAdjust(false);
    router.refresh();
  }

  const googleMapsUrl =
    site.lat != null && site.lng != null
      ? `https://www.google.com/maps?q=${site.lat},${site.lng}`
      : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-foreground">{site.address}</p>
          {site.geocodedAt && (
            <p className="text-xs text-muted">Located {formatDateTime(site.geocodedAt)}</p>
          )}
        </div>
        <div className="flex gap-2">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-black/[.04]"
            >
              <ExternalLink size={15} />
              Open in Google Maps
            </a>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdjust((s) => !s)}>
            <MapPin size={15} />
            {site.lat != null ? "Change location" : "Set location"}
          </Button>
        </div>
      </div>

      {site.lat != null && site.lng != null && !showAdjust ? (
        <MapView
          sites={[
            {
              id: site.id,
              lat: site.lat,
              lng: site.lng,
              customerName: site.customerName,
              address: site.address,
            },
          ]}
          interactiveLink={false}
          height="360px"
        />
      ) : null}

      {showAdjust && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground">
            The free address lookup doesn&apos;t always find exact addresses in Sri Lanka. Pick
            whichever is easiest:
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MapPin size={15} /> 1. Try the address
              </p>
              <p className="mb-3 text-xs text-muted">Looks up &quot;{site.address}&quot; automatically.</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => submit("address")}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Try address lookup
              </Button>
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Link2 size={15} /> 2. Paste a Google Maps link
              </p>
              <p className="mb-3 text-xs text-muted">
                In Google Maps: find the site, tap Share → Copy link, then paste it here.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://maps.app.goo.gl/..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={loading || !linkInput.trim()}
                  onClick={() => submit("link", { input: linkInput })}
                >
                  Use
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Crosshair size={15} /> 3. Drop a pin manually
              </p>
              <p className="mb-3 text-xs text-muted">Click the exact spot on the map below.</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={loading || !manualPick}
                onClick={() => manualPick && submit("manual", manualPick)}
              >
                {manualPick
                  ? `Confirm pin (${manualPick.lat.toFixed(5)}, ${manualPick.lng.toFixed(5)})`
                  : "Click the map to pick →"}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <MapView
            sites={
              manualPick
                ? [
                    {
                      id: "pending",
                      lat: manualPick.lat,
                      lng: manualPick.lng,
                      customerName: site.customerName,
                      address: "New pin — not saved yet",
                    },
                  ]
                : site.lat != null && site.lng != null
                  ? [
                      {
                        id: site.id,
                        lat: site.lat,
                        lng: site.lng,
                        customerName: site.customerName,
                        address: site.address,
                      },
                    ]
                  : []
            }
            interactiveLink={false}
            height="320px"
            center={
              manualPick
                ? [manualPick.lat, manualPick.lng]
                : site.lat != null && site.lng != null
                  ? [site.lat, site.lng]
                  : undefined
            }
            onSelect={(lat, lng) => setManualPick({ lat, lng })}
          />
        </div>
      )}

      {site.lat == null && !showAdjust && (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
          Not located yet — click &quot;Set location&quot; above.
        </div>
      )}
    </div>
  );
}
