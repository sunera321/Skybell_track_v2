"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { fileUrl } from "@/lib/file-url";
import { formatDateTime } from "@/lib/utils";
import type { SiteWithRelations } from "./types";

export function PhotosTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        await fetch(`/api/sites/${site.id}/photos`, {
          method: "POST",
          body: formData,
        });
      }
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    }
  }

  async function deletePhoto(id: string) {
    await fetch(`/api/photos/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          {site.photos.length} photo(s)
        </p>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={15} />
          {uploading ? "Uploading..." : "Upload Photos"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </div>

      {site.photos.length === 0 ? (
        <p className="text-sm text-muted">
          No photos uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {site.photos.map((photo) => {
            const url = fileUrl(
              site.id,
              "photos",
              photo.filename
            );

            return (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-black/5"
              >
                <img
                  src={url}
                  alt={
                    photo.caption ??
                    photo.originalName ??
                    "Photo"
                  }
                  className="h-full w-full cursor-pointer object-cover"
                  onClick={() => setLightbox(url)}
                />

                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="
                    absolute top-1.5 right-1.5
                    rounded-full bg-black/60 p-1.5
                    text-white opacity-0
                    transition-opacity
                    group-hover:opacity-100
                  "
                  aria-label="Delete photo"
                >
                  <Trash2 size={13} />
                </button>

                <div
                  className="
                    absolute inset-x-0 bottom-0
                    bg-gradient-to-t
                    from-black/70 to-transparent
                    px-2 py-1.5 text-[11px]
                    text-white opacity-0
                    transition-opacity
                    group-hover:opacity-100
                  "
                >
                  {formatDateTime(photo.uploadedAt)}

                  {photo.uploadedBy?.name
                    ? ` · ${photo.uploadedBy.name}`
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/80 p-4
          "
          onClick={() => setLightbox(null)}
        >
          <button
            className="
              absolute top-4 right-4
              text-white
            "
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>

          <img
            src={lightbox}
            alt="Preview"
            className="
              max-h-full max-w-full
              rounded-lg object-contain
            "
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
