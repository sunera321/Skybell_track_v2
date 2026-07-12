import Link from "next/link";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { expenseReceiptUrl } from "@/lib/file-url";
import type { Prisma } from "@/generated/prisma/client";

export default async function ExpensesPage() {
  const user = await requireUser();
  const where: Prisma.TravelExpenseWhereInput = user.role === "ADMIN" ? {} : { userId: user.id };

  const [expenses, sites] = await Promise.all([
    prisma.travelExpense.findMany({
      where,
      orderBy: { date: "desc" },
      include: { site: { select: { id: true, customerName: true } }, user: { select: { name: true } } },
    }),
    prisma.site.findMany({ select: { id: true, customerName: true }, orderBy: { customerName: "asc" } }),
  ]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byUser = new Map<string, number>();
  for (const e of expenses) {
    const key = e.user?.name ?? "Unassigned";
    byUser.set(key, (byUser.get(key) ?? 0) + e.amount);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Traveling expenses</h1>
        <AddExpenseForm sites={sites} />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted">Total recorded</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(total)}</p>
        </Card>
        {[...byUser.entries()].slice(0, 2).map(([name, amount]) => (
          <Card key={name} className="p-4">
            <p className="text-xs text-muted">{name}</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(amount)}</p>
          </Card>
        ))}
      </div>

      {expenses.length === 0 ? (
        <Card className="px-4 py-10 text-center text-sm text-muted">
          No travel expenses recorded yet.
        </Card>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid gap-3 sm:hidden">
            {expenses.map((e) => (
              <Card key={e.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{e.purpose}</div>
                    <div className="text-xs text-muted">{formatDate(e.date)}</div>
                  </div>
                  <div className="text-right font-medium text-foreground">{formatCurrency(e.amount)}</div>
                </div>

                <div className="mb-3 text-xs text-muted">
                  {e.site ? (
                    <Link href={`/sites/${e.site.id}`} className="text-brand-600 hover:underline">
                      {e.site.customerName}
                    </Link>
                  ) : (
                    "No site"
                  )}
                  {" · "}
                  {e.user?.name ?? "Unassigned"}
                  {e.distanceKm ? ` · ${e.distanceKm} km` : ""}
                </div>

                <div className="flex items-center justify-between">
                  {e.receiptFilename ? (
                    <a
                      href={expenseReceiptUrl(e.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
                    >
                      <Receipt size={15} />
                      View receipt
                    </a>
                  ) : (
                    <span className="text-sm text-muted">No receipt</span>
                  )}
                  <DeleteExpenseButton id={e.id} />
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden overflow-hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[.02] text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                    <th className="px-4 py-3 font-medium">Site</th>
                    <th className="px-4 py-3 font-medium">Logged by</th>
                    <th className="px-4 py-3 font-medium">Distance</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Receipt</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-black/[.02]">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="px-4 py-3">{e.purpose}</td>
                      <td className="px-4 py-3">
                        {e.site ? (
                          <Link href={`/sites/${e.site.id}`} className="text-brand-600 hover:underline">
                            {e.site.customerName}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{e.user?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{e.distanceKm ? `${e.distanceKm} km` : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3">
                        {e.receiptFilename ? (
                          <a
                            href={expenseReceiptUrl(e.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-600 hover:underline"
                          >
                            <Receipt size={15} />
                            View
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteExpenseButton id={e.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
