"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Receipt,
  Users,
  ScrollText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/sites", label: "Sites", icon: Building2, adminOnly: false },
  { href: "/map", label: "Map", icon: MapPin, adminOnly: false },
  { href: "/expenses", label: "Expenses", icon: Receipt, adminOnly: false },
  { href: "/team", label: "Team", icon: Users, adminOnly: true },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText, adminOnly: true },
];

export function Nav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "STAFF" };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleLinks = links.filter((l) => !l.adminOnly || user.role === "ADMIN");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
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
          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-muted hover:bg-black/[.04] hover:text-foreground"
                  )}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-muted">{user.name ?? user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-black/[.04] hover:text-foreground"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-black/[.04]"
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-black/[.04]"
          >
            <LogOut size={16} />
            Sign out ({user.name ?? user.email})
          </button>
        </nav>
      )}
    </header>
  );
}
