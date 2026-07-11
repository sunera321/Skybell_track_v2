"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { LinkButton, Button } from "@/components/ui/Button";

export function SiteHeaderActions({
  siteId,
  canDelete,
}: {
  siteId: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this site and all of its photos, documents and voice notes?")) return;
    setDeleting(true);
    const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/sites");
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <LinkButton href={`/sites/${siteId}/edit`} variant="secondary" size="sm">
        <Pencil size={15} />
        Edit
      </LinkButton>
      {canDelete && (
        <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={deleting}>
          <Trash2 size={15} />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      )}
    </div>
  );
}
