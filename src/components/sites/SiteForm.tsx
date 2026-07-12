"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  JOB_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
} from "@/lib/labels";
import { JOB_STATUS_VALUES, QUOTATION_STATUS_VALUES } from "@/lib/validation";
import type { Site } from "@/generated/prisma/client";

export function SiteForm({
  site,
  engineers,
  managers,
}: {
  site?: Site;
  engineers: string[];
  managers: string[];
}) {
  const router = useRouter();
  const isEdit = !!site;

  const [form, setForm] = useState({
    engineer: site?.engineer ?? "",
    microbusinessManager: site?.microbusinessManager ?? "",
    customerName: site?.customerName ?? "",
    address: site?.address ?? "",
    contactNumber: site?.contactNumber ?? "",
    scope: site?.scope ?? "",
    poNumber: site?.poNumber ?? "",
    invoiceNumber: site?.invoiceNumber ?? "",
    customerRequirement: site?.customerRequirement ?? "",
    jobStatus: site?.jobStatus ?? "PENDING",
    jobStatusNote: site?.jobStatusNote ?? "",
    quotationStatus: site?.quotationStatus ?? "NOT_SENT",
    solutionDetailsLochana: site?.solutionDetailsLochana ?? "",
    solutionDetailsBuddika: site?.solutionDetailsBuddika ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/sites/${site!.id}` : "/api/sites", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save the site. Check the required fields and try again.");
      return;
    }

    const { site: saved } = await res.json();
    router.push(`/sites/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Engineer / Telecom location" htmlFor="engineer">
          <Input
            id="engineer"
            list="engineer-options"
            required
            value={form.engineer}
            onChange={(e) => update("engineer", e.target.value)}
          />
          <datalist id="engineer-options">
            {engineers.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </FieldGroup>

        <FieldGroup label="Microbusiness manager" htmlFor="microbusinessManager">
          <Input
            id="microbusinessManager"
            list="manager-options"
            required
            value={form.microbusinessManager}
            onChange={(e) => update("microbusinessManager", e.target.value)}
          />
          <datalist id="manager-options">
            {managers.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </FieldGroup>
      </div>

      <FieldGroup label="Customer name" htmlFor="customerName">
        <Input
          id="customerName"
          required
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Address" htmlFor="address">
        <Textarea
          id="address"
          required
          rows={2}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Contact number" htmlFor="contactNumber">
          <Input
            id="contactNumber"
            value={form.contactNumber ?? ""}
            onChange={(e) => update("contactNumber", e.target.value)}
          />
        </FieldGroup>

        <FieldGroup label="Scope of work" htmlFor="scope">
          <Input
            id="scope"
            value={form.scope ?? ""}
            onChange={(e) => update("scope", e.target.value)}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Purchase order number" htmlFor="poNumber">
          <Input
            id="poNumber"
            value={form.poNumber ?? ""}
            onChange={(e) => update("poNumber", e.target.value)}
          />
        </FieldGroup>

        <FieldGroup label="Invoice number" htmlFor="invoiceNumber">
          <Input
            id="invoiceNumber"
            value={form.invoiceNumber ?? ""}
            onChange={(e) => update("invoiceNumber", e.target.value)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Customer requirement" htmlFor="customerRequirement">
        <Textarea
          id="customerRequirement"
          rows={3}
          value={form.customerRequirement ?? ""}
          onChange={(e) => update("customerRequirement", e.target.value)}
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Job status" htmlFor="jobStatus">
          <Select
            id="jobStatus"
            value={form.jobStatus}
            onChange={(e) => update("jobStatus", e.target.value as typeof form.jobStatus)}
          >
            {JOB_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {JOB_STATUS_LABELS[v]}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="Quotation status" htmlFor="quotationStatus">
          <Select
            id="quotationStatus"
            value={form.quotationStatus}
            onChange={(e) =>
              update("quotationStatus", e.target.value as typeof form.quotationStatus)
            }
          >
            {QUOTATION_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {QUOTATION_STATUS_LABELS[v]}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup
        label="Job status note"
        htmlFor="jobStatusNote"
        hint="Free-text detail, e.g. a postponement reason or revisit date."
      >
        <Input
          id="jobStatusNote"
          value={form.jobStatusNote ?? ""}
          onChange={(e) => update("jobStatusNote", e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Solution details — Lochana" htmlFor="solutionDetailsLochana">
        <Textarea
          id="solutionDetailsLochana"
          rows={3}
          value={form.solutionDetailsLochana ?? ""}
          onChange={(e) => update("solutionDetailsLochana", e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Solution details — Buddika" htmlFor="solutionDetailsBuddika">
        <Textarea
          id="solutionDetailsBuddika"
          rows={3}
          value={form.solutionDetailsBuddika ?? ""}
          onChange={(e) => update("solutionDetailsBuddika", e.target.value)}
        />
      </FieldGroup>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save changes" : "Create site"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
