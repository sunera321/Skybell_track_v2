"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { OverviewTab } from "./OverviewTab";
import { TasksTab } from "./TasksTab";
import { BomTab } from "./BomTab";
import { PhotosTab } from "./PhotosTab";
import { DocumentsTab } from "./DocumentsTab";
import { VoiceNotesTab } from "./VoiceNotesTab";
import { MapTab } from "./MapTab";
import { OrderInfoTab } from "./OrderInfoTab";
import { CustomerRequirementTab } from "./CustomerRequirementTab";
import type { SiteWithRelations } from "./types";

const TAB_DEFS = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "bom", label: "BOM" },
  { key: "photos", label: "Photos" },
  { key: "documents", label: "Documents" },
  { key: "voice", label: "Voice Notes" },
  { key: "map", label: "Map" },
  { key: "orderInfo", label: "Order Info" },
  { key: "customerRequirement", label: "Customer Requirement" },
] as const;

export function SiteDetailTabs({ site }: { site: SiteWithRelations }) {
  const [active, setActive] = useState<(typeof TAB_DEFS)[number]["key"]>("overview");

  const counts: Record<string, number> = {
    tasks: site.tasks.filter((t) => !t.done).length,
    bom: site.bomItems.length,
    photos: site.photos.length,
    documents: site.documents.length,
    voice: site.voiceNotes.length,
  };

  return (
    <div>
      <Tabs
        tabs={TAB_DEFS.map((t) => ({ ...t, count: counts[t.key] }))}
        active={active}
        onChange={(k) => setActive(k as typeof active)}
      />
      <div className="pt-5">
        {active === "overview" && <OverviewTab site={site} />}
        {active === "tasks" && <TasksTab site={site} />}
        {active === "bom" && <BomTab site={site} />}
        {active === "photos" && <PhotosTab site={site} />}
        {active === "documents" && <DocumentsTab site={site} />}
        {active === "voice" && <VoiceNotesTab site={site} />}
        {active === "map" && <MapTab site={site} />}
        {active === "orderInfo" && <OrderInfoTab site={site} />}
        {active === "customerRequirement" && <CustomerRequirementTab site={site} />}
      </div>
    </div>
  );
}
