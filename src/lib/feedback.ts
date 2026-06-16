import { supabase, isSupabaseConfigured } from "./supabase";
import type { TaskFeedback } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

function rowToFeedback(r: Record<string, unknown>): TaskFeedback {
  return {
    $id: r.id as string,
    taskId: r.task_id as string,
    authorId: r.author_id as string,
    authorRole: r.author_role as "admin" | "expert",
    kind: r.kind as TaskFeedback["kind"],
    body: r.body as string,
    createdAt: r.created_at as string,
  };
}

/** All feedback for a task, oldest first. */
export async function listFeedback(taskId: string): Promise<TaskFeedback[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("task_feedback")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToFeedback);
}

export async function postFeedback(input: {
  taskId: string;
  authorId: string;
  authorRole: "admin" | "expert";
  body: string;
  kind?: TaskFeedback["kind"];
}): Promise<TaskFeedback> {
  const { data, error } = await supabase
    .from("task_feedback")
    .insert({
      task_id: input.taskId,
      author_id: input.authorId,
      author_role: input.authorRole,
      kind: input.kind ?? (input.authorRole === "expert" ? "response" : "message"),
      body: input.body,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToFeedback(data);
}

/** Live feedback updates for a task. Returns an unsubscribe fn. */
export function subscribeFeedback(taskId: string, onInsert: (f: TaskFeedback) => void): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`feedback:${taskId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "task_feedback", filter: `task_id=eq.${taskId}` },
      (payload) => onInsert(rowToFeedback(payload.new as Record<string, unknown>))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
