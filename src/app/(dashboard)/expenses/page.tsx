import Link from "next/link";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { expenseReceiptUrl } from "@/lib/file-url";

export default async function ExpensesPage() {
  const [expenses, sites] = await Promise.all([
    prisma.travelExpense.findMany({
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

      <Card className="overflow-hidden">
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
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No travel expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
