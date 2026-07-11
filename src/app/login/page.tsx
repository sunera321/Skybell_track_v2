import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-lg font-semibold text-white">
            S
          </span>
          <h1 className="text-xl font-semibold text-foreground">Skybell Site Tracker</h1>
          <p className="text-sm text-muted">Sign in to manage site inspections</p>
        </div>
        <Card>
          <CardBody>
            <LoginForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
