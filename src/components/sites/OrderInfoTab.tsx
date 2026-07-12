"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { SiteWithRelations } from "./types";

export function OrderInfoTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [poNumber, setPoNumber] = useState(site.poNumber ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(site.invoiceNumber ?? "");
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
      body: JSON.stringify({ poNumber, invoiceNumber }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save order info.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Purchase order number" htmlFor="poNumber">
          <Input
            id="poNumber"
            value={poNumber}
            onChange={(e) => {
              setPoNumber(e.target.value);
              setSaved(false);
            }}
          />
        </FieldGroup>

        <FieldGroup label="Invoice number" htmlFor="invoiceNumber">
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => {
              setInvoiceNumber(e.target.value);
              setSaved(false);
            }}
          />
        </FieldGroup>
      </div>

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
