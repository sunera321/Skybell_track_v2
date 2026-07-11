"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={onDelete} className="cursor-pointer text-muted hover:text-danger" aria-label="Delete expense">
      <Trash2 size={15} />
    </button>
  );
}
