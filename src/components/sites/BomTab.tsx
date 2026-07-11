"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { SiteWithRelations } from "./types";

export function BomTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = site.bomItems.reduce<Record<string, typeof site.bomItems>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  async function addItem(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!category.trim() || !item.trim() || !quantity.trim()) {
      setError("Category, item and quantity are all required.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/sites/${site.id}/bom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, item, quantity }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not add item.");
      return;
    }
    setCategory("");
    setItem("");
    setQuantity("");
    router.refresh();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/bom/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addItem} className="mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Input
          placeholder="Category (e.g. Network)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input placeholder="Item" value={item} onChange={(e) => setItem(e.target.value)} />
        <Input
          placeholder="Quantity (e.g. 500m)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Plus size={16} />
          Add
        </Button>
      </form>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-muted">No BOM items recorded yet.</p>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {cat}
            </h3>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {items.map((b) => (
                    <tr key={b.id}>
                      <td className="px-3 py-2">{b.item}</td>
                      <td className="px-3 py-2 text-muted">{b.quantity}</td>
                      <td className="w-10 px-3 py-2 text-right">
                        <button
                          onClick={() => deleteItem(b.id)}
                          className="cursor-pointer text-muted hover:text-danger"
                          aria-label="Delete item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
