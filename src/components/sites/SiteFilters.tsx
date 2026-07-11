"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Select } from "@/components/ui/Field";
import { JOB_STATUS_LABELS, QUOTATION_STATUS_LABELS } from "@/lib/labels";
import { JOB_STATUS_VALUES, QUOTATION_STATUS_VALUES } from "@/lib/validation";

export function SiteFilters({
  engineers,
  managers,
}: {
  engineers: string[];
  managers: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const debouncedSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const t = setTimeout(() => debouncedSearch(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-4">
      <Input
        placeholder="Search customer, address, scope..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:col-span-2"
      />
      <Select
        value={searchParams.get("engineer") ?? ""}
        onChange={(e) => setParam("engineer", e.target.value)}
      >
        <option value="">All engineers</option>
        {engineers.map((eng) => (
          <option key={eng} value={eng}>
            {eng}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("microbusinessManager") ?? ""}
        onChange={(e) => setParam("microbusinessManager", e.target.value)}
      >
        <option value="">All microbusiness managers</option>
        {managers.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("jobStatus") ?? ""}
        onChange={(e) => setParam("jobStatus", e.target.value)}
      >
        <option value="">All job statuses</option>
        {JOB_STATUS_VALUES.map((v) => (
          <option key={v} value={v}>
            {JOB_STATUS_LABELS[v]}
          </option>
        ))}
      </Select>
      <Select
        value={searchParams.get("quotationStatus") ?? ""}
        onChange={(e) => setParam("quotationStatus", e.target.value)}
      >
        <option value="">All quotation statuses</option>
        {QUOTATION_STATUS_VALUES.map((v) => (
          <option key={v} value={v}>
            {QUOTATION_STATUS_LABELS[v]}
          </option>
        ))}
      </Select>
    </div>
  );
}
