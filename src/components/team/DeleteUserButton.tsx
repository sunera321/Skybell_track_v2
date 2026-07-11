"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm(`Remove ${name} from the team?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={onDelete} className="cursor-pointer text-muted hover:text-danger" aria-label="Remove user">
      <Trash2 size={15} />
    </button>
  );
}
