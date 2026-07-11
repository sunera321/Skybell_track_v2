"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS } from "@/lib/labels";

export function AddUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "STAFF" as "ADMIN" | "STAFF" });

  function reset() {
    setForm({ name: "", email: "", role: "STAFF" });
    setCreated(null);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error && typeof body.error === "string" ? body.error : "Could not create user.");
      return;
    }

    const data = await res.json();
    setCreated({ email: data.user.email, tempPassword: data.tempPassword });
    router.refresh();
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <UserPlus size={16} />
        Add team member
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={created ? "Team member created" : "Add team member"}
      >
        {created ? (
          <div>
            <p className="mb-3 text-sm text-foreground">
              Share these temporary credentials with <strong>{created.email}</strong>. They&apos;ll be
              asked to change the password on first login.
            </p>
            <div className="mb-4 rounded-lg border border-border bg-black/[.03] p-3 font-mono text-sm">
              <p>Email: {created.email}</p>
              <p>Temporary password: {created.tempPassword}</p>
            </div>
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <FieldGroup label="Name" htmlFor="name">
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label="Role" htmlFor="role">
              <Select
                id="role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "STAFF" }))}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            {error && <p className="mb-3 text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
