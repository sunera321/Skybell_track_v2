"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { fileUrl } from "@/lib/file-url";
import { formatDateTime } from "@/lib/utils";
import { DOC_TYPE_LABELS } from "@/lib/labels";
import { DOC_TYPE_VALUES } from "@/lib/validation";
import type { SiteWithRelations } from "./types";

export function DocumentsTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<(typeof DOC_TYPE_VALUES)[number]>("QUOTATION");
  const [uploading, setUploading] = useState(false);

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      await fetch(`/api/sites/${site.id}/documents`, { method: "POST", body: formData });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function deleteDocument(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={docType}
          onChange={(e) => setDocType(e.target.value as typeof docType)}
          className="w-auto"
        >
          {DOC_TYPE_VALUES.map((v) => (
            <option key={v} value={v}>
              {DOC_TYPE_LABELS[v]}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={15} />
          {uploading ? "Uploading..." : "Upload document"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </div>

      {site.documents.length === 0 ? (
        <p className="text-sm text-muted">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {site.documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-3 py-2.5">
              <FileText size={18} className="shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.originalName}</p>
                <p className="text-xs text-muted">
                  {formatDateTime(doc.uploadedAt)}
                  {doc.uploadedBy?.name ? ` · ${doc.uploadedBy.name}` : ""}
                </p>
              </div>
              <Badge tone="neutral">{DOC_TYPE_LABELS[doc.docType]}</Badge>
              <a
                href={fileUrl(site.id, "documents", doc.filename)}
                download={doc.originalName}
                className="cursor-pointer text-muted hover:text-brand-600"
                aria-label="Download document"
              >
                <Download size={16} />
              </a>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="cursor-pointer text-muted hover:text-danger"
                aria-label="Delete document"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
