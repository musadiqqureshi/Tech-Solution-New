import { supabase, isSupabaseConfigured } from "./supabase";
import type { Attachment, AttachmentKind } from "./types";

const BUCKET = "attachments";

function rowToAttachment(r: Record<string, unknown>): Attachment {
  return {
    $id: r.id as string,
    uploadedBy: r.uploaded_by as string,
    entityType: r.entity_type as "order" | "task",
    entityId: r.entity_id as string,
    kind: r.kind as AttachmentKind,
    name: r.name as string,
    url: r.url as string,
    path: r.path as string,
    size: r.size != null ? Number(r.size) : undefined,
    createdAt: r.created_at as string,
  };
}

export async function listAttachments(
  entityType: "order" | "task",
  entityId: string,
  kind?: AttachmentKind
): Promise<Attachment[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase
    .from("attachments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToAttachment);
}

export async function uploadAttachment(input: {
  file: File;
  entityType: "order" | "task";
  entityId: string;
  kind: AttachmentKind;
  uploaderId: string;
}): Promise<Attachment> {
  const safe = input.file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${input.entityType}/${input.entityId}/${input.kind}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(BUCKET).upload(path, input.file, { upsert: false });
  if (up.error) throw up.error;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from("attachments")
    .insert({
      uploaded_by: input.uploaderId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      kind: input.kind,
      name: input.file.name,
      url: pub.publicUrl,
      path,
      size: input.file.size,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToAttachment(data);
}

export async function deleteAttachment(att: Attachment): Promise<void> {
  if (att.path) await supabase.storage.from(BUCKET).remove([att.path]).catch(() => {});
  if (att.$id) {
    const { error } = await supabase.from("attachments").delete().eq("id", att.$id);
    if (error) throw error;
  }
}

export function formatBytes(n?: number): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
