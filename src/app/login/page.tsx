import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Image
              src="/skybell-logo.png"
              alt="Skybell"
              width={1997}
              height={884}
              preload
              className="h-8 w-auto"
            />
          </Link>
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
