import { Phone, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SiteWithRelations } from "./types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap text-foreground">{value}</dd>
    </div>
  );
}

export function OverviewTab({ site }: { site: SiteWithRelations }) {
  const expenseTotal = site.travelExpenses.reduce((sum, e) => sum + e.amount, 0);
  const openTasks = site.tasks.filter((t) => !t.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-black/[.015] p-4">
        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-muted" />
          <span className="text-foreground">{site.engineer}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-muted" />
          <span className="text-foreground">{site.microbusinessManager}</span>
          <span className="text-xs text-muted">(Microbusiness manager)</span>
        </div>
        {site.contactNumber && (
          <a
            href={`tel:${site.contactNumber.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-2 text-sm text-brand-600 hover:underline"
          >
            <Phone size={16} />
            {site.contactNumber}
          </a>
        )}
      </div>

      <dl className="grid gap-5 sm:grid-cols-2">
        <Field label="Scope of work" value={site.scope} />
        <Field label="Job status note" value={site.jobStatusNote} />
        <Field label="Solution details — Lochana" value={site.solutionDetailsLochana} />
        <Field label="Solution details — Buddika" value={site.solutionDetailsBuddika} />
      </dl>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Open tasks" value={openTasks} />
        <StatCard label="BOM items" value={site.bomItems.length} />
        <StatCard label="Photos" value={site.photos.length} />
        <StatCard label="Documents" value={site.documents.length} />
        <StatCard label="Voice notes" value={site.voiceNotes.length} />
      </div>

      {site.travelExpenses.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Travel expenses for this site
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border text-sm">
            {site.travelExpenses.map((exp) => (
              <li key={exp.id} className="flex items-center justify-between px-3 py-2">
                <span>
                  {formatDate(exp.date)} — {exp.purpose}
                </span>
                <span className="font-medium">{formatCurrency(exp.amount)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between bg-black/[.02] px-3 py-2 font-medium">
              <span>Total</span>
              <span>{formatCurrency(expenseTotal)}</span>
            </li>
          </ul>
        </div>
      )}

      <p className="text-xs text-muted">
        Created {formatDate(site.createdAt)} · Last updated {formatDate(site.updatedAt)}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
