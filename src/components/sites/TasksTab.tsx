"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn, formatDateTime } from "@/lib/utils";
import type { SiteWithRelations } from "./types";

export function TasksTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openTasks = site.tasks.filter((t) => !t.done);
  const doneTasks = site.tasks.filter((t) => t.done);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/sites/${site.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not add task.");
      return;
    }
    setDescription("");
    router.refresh();
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    router.refresh();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addTask} className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          placeholder="Task description (e.g. Run fiber to junction box)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Plus size={16} />
          Add task
        </Button>
      </form>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {site.tasks.length === 0 && (
        <p className="text-sm text-muted">No tasks added yet.</p>
      )}

      <div className="space-y-5">
        {openTasks.length > 0 && (
          <TaskGroup
            title={`Open (${openTasks.length})`}
            tasks={openTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}
        {doneTasks.length > 0 && (
          <TaskGroup
            title={`Done (${doneTasks.length})`}
            tasks={doneTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}
      </div>
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  onDelete,
}: {
  title: string;
  tasks: SiteWithRelations["tasks"];
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <ul className="divide-y divide-border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 px-3 py-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={(e) => onToggle(task.id, e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-brand-600"
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
              />
              <div className="flex-1">
                <p className={cn("text-sm text-foreground", task.done && "text-muted line-through")}>
                  {task.description}
                </p>
                {task.done && task.doneAt && (
                  <p className="text-xs text-muted">Done {formatDateTime(task.doneAt)}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="cursor-pointer text-muted hover:text-danger"
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
