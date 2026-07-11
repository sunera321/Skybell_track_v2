"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fileUrl } from "@/lib/file-url";
import { formatDateTime } from "@/lib/utils";
import type { SiteWithRelations } from "./types";

function formatDuration(seconds: number | null) {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceNotesTab({ site }: { site: SiteWithRelations }) {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", new File([blob], "voice-note.webm", { type: "audio/webm" }));
        formData.append("durationSeconds", String(durationSeconds));
        await fetch(`/api/sites/${site.id}/voice-notes`, { method: "POST", body: formData });
        setUploading(false);
        router.refresh();
      };
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access was denied or unavailable.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function deleteNote(id: string) {
    await fetch(`/api/voice-notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        {!recording ? (
          <Button type="button" onClick={startRecording} disabled={uploading}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            {uploading ? "Saving..." : "Record voice note"}
          </Button>
        ) : (
          <Button type="button" variant="danger" onClick={stopRecording}>
            <Square size={16} />
            Stop recording
          </Button>
        )}
        {recording && (
          <span className="flex items-center gap-1.5 text-sm text-danger">
            <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
            Recording...
          </span>
        )}
      </div>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {site.voiceNotes.length === 0 ? (
        <p className="text-sm text-muted">No voice notes recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {site.voiceNotes.map((note) => (
            <li
              key={note.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
            >
              <audio controls src={fileUrl(site.id, "voice-notes", note.filename)} className="h-9 flex-1 min-w-[220px]" />
              <span className="text-xs text-muted">{formatDuration(note.durationSeconds)}</span>
              <span className="text-xs text-muted">
                {formatDateTime(note.recordedAt)}
                {note.recordedBy?.name ? ` · ${note.recordedBy.name}` : ""}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="cursor-pointer text-muted hover:text-danger"
                aria-label="Delete voice note"
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
