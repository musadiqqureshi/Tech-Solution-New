"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, FileText, Download, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  listAttachments, uploadAttachment, deleteAttachment, formatBytes,
} from "@/lib/attachments";
import type { Attachment, AttachmentKind } from "@/lib/types";

export default function Attachments({
  entityType,
  entityId,
  kind,
  title,
  canUpload = false,
  emptyText = "No files yet.",
}: {
  entityType: "order" | "task";
  entityId: string;
  kind: AttachmentKind;
  title: string;
  canUpload?: boolean;
  emptyText?: string;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listAttachments(entityType, entityId, kind)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId, kind]);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length || !user?.id) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const att = await uploadAttachment({ file, entityType, entityId, kind, uploaderId: user.id });
        setItems((prev) => [att, ...prev]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (att: Attachment) => {
    if (!confirm(`Remove ${att.name}?`)) return;
    try {
      await deleteAttachment(att);
      setItems((prev) => prev.filter((x) => x.$id !== att.$id));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <FileText size={16} className="text-aura-cyan" /> {title}
      </h3>

      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors mb-4 ${
            drag ? "border-aura-purple bg-aura-purple/10" : "border-white/15 hover:border-white/30"
          }`}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin text-aura-cyan mx-auto" />
          ) : (
            <>
              <UploadCloud size={22} className="text-aura-cyan mx-auto mb-2" />
              <p className="text-sm text-gray-300">Drag &amp; drop files here, or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Any file type · up to ~50 MB each</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => { upload(e.target.files); e.target.value = ""; }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      {loading ? (
        <div className="grid place-items-center py-6"><Loader2 size={20} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.$id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
              <FileText size={16} className="text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{a.name}</p>
                <p className="text-[11px] text-gray-500">{formatBytes(a.size)}</p>
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer" download className="btn-secondary !p-2" title="Download">
                <Download size={14} />
              </a>
              {user?.id === a.uploadedBy && (
                <button onClick={() => remove(a)} className="btn-secondary !p-2" title="Remove">
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
