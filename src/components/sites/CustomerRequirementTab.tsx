"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Textarea, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { SiteWithRelations } from "./types";

export function CustomerRequirementTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [customerRequirement, setCustomerRequirement] = useState(site.customerRequirement ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerRequirement }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save customer requirement.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <FieldGroup label="Customer requirement" htmlFor="customerRequirement">
        <Textarea
          id="customerRequirement"
          rows={6}
          value={customerRequirement}
          onChange={(e) => {
            setCustomerRequirement(e.target.value);
            setSaved(false);
          }}
        />
      </FieldGroup>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-sm text-muted">Saved.</span>}
      </div>
    </form>
  );
}
