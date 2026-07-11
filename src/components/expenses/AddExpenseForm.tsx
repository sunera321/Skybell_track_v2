"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AddExpenseForm({
  sites,
}: {
  sites: { id: string; customerName: string }[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    siteId: "",
    date: today,
    purpose: "",
    amount: "",
    distanceKm: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (form.siteId) formData.append("siteId", form.siteId);
    formData.append("date", form.date);
    formData.append("purpose", form.purpose);
    formData.append("amount", form.amount);
    if (form.distanceKm) formData.append("distanceKm", form.distanceKm);
    const receipt = fileInputRef.current?.files?.[0];
    if (receipt) formData.append("receipt", receipt);

    const res = await fetch("/api/expenses", { method: "POST", body: formData });

    setLoading(false);

    if (!res.ok) {
      setError("Could not save this expense.");
      return;
    }

    setForm({ siteId: "", date: today, purpose: "", amount: "", distanceKm: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={16} />
        Add expense
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add travel expense">
        <form onSubmit={onSubmit}>
          <FieldGroup label="Related site (optional)" htmlFor="siteId">
            <Select
              id="siteId"
              value={form.siteId}
              onChange={(e) => update("siteId", e.target.value)}
            >
              <option value="">— None —</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.customerName}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup label="Date" htmlFor="date">
            <Input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </FieldGroup>

          <FieldGroup label="Purpose" htmlFor="purpose">
            <Input
              id="purpose"
              required
              placeholder="e.g. Site visit — Kelaniya"
              value={form.purpose}
              onChange={(e) => update("purpose", e.target.value)}
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Amount (LKR)" htmlFor="amount">
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Distance (km)" htmlFor="distanceKm">
              <Input
                id="distanceKm"
                type="number"
                min="0"
                step="0.1"
                value={form.distanceKm}
                onChange={(e) => update("distanceKm", e.target.value)}
              />
            </FieldGroup>
          </div>

          <FieldGroup
            label="Bill / receipt image (optional)"
            htmlFor="receipt"
            hint="Photo of the receipt or bill for this expense."
          >
            <input
              ref={fileInputRef}
              id="receipt"
              type="file"
              accept="image/*"
              capture="environment"
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </FieldGroup>

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Add expense"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
