"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function GeocodeAllButton({ siteIds }: { siteIds: string[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  async function run() {
    setRunning(true);
    setProgress(0);
    for (let i = 0; i < siteIds.length; i++) {
      await fetch(`/api/sites/${siteIds[i]}/geocode`, { method: "POST" }).catch(() => null);
      setProgress(i + 1);
      // Respect Nominatim's usage policy of max 1 request/second.
      if (i < siteIds.length - 1) await new Promise((r) => setTimeout(r, 1100));
    }
    setRunning(false);
    router.refresh();
  }

  if (siteIds.length === 0) return null;

  return (
    <Button type="button" variant="secondary" size="sm" onClick={run} disabled={running}>
      {running ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
      {running
        ? `Locating ${progress}/${siteIds.length}...`
        : `Locate all unmapped sites (${siteIds.length})`}
    </Button>
  );
}
