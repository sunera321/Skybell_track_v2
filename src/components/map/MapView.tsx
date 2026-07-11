"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-border bg-black/[.02] text-sm text-muted">
      Loading map...
    </div>
  ),
});

export type { MapSite } from "./LeafletMap";
