"use client";

import { useState, FormEvent } from "react";
import { signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Input, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    setLoading(false);

    if (!res.ok) {
      setError("Could not update password.");
      return;
    }

    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Set a new password</h1>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-muted">
            You&apos;re using a temporary password. Choose a new one to continue.
          </p>
          <form onSubmit={onSubmit}>
            <FieldGroup label="New password" htmlFor="password">
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Confirm new password" htmlFor="confirm">
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </FieldGroup>
            {error && <p className="mb-3 text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save and sign in again"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
