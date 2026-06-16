import { supabase, isSupabaseConfigured } from "./supabase";
import type { Task, TaskStatus, Currency, ExpertOption } from "./types";

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; color: string; step: number }
> = {
  assigned: { label: "Assigned", color: "#fbbf24", step: 0 },
  in_progress: { label: "In Progress", color: "#a78bfa", step: 1 },
  submitted: { label: "Submitted for Review", color: "#22d3ee", step: 2 },
  revision_requested: { label: "Revision Requested", color: "#f87171", step: 2 },
  under_revision: { label: "Under Revision", color: "#fb923c", step: 1 },
  approved: { label: "Approved", color: "#60a5fa", step: 3 },
  delivered: { label: "Delivered to Client", color: "#818cf8", step: 4 },
  completed: { label: "Completed", color: "#34d399", step: 5 },
};

export const TASK_FLOW: TaskStatus[] = [
  "assigned",
  "in_progress",
  "submitted",
  "approved",
  "delivered",
  "completed",
];

/** Profit is admin-only: client budget minus expert budget. */
export function taskProfit(t: Task): number | null {
  if (t.clientBudget == null || t.expertBudget == null) return null;
  return t.clientBudget - t.expertBudget;
}

function rowToTask(r: Record<string, unknown>): Task {
  return {
    $id: r.id as string,
    $createdAt: r.created_at as string,
    taskNumber: (r.task_number as string) ?? undefined,
    orderId: (r.order_id as string) ?? undefined,
    title: r.title as string,
    description: r.description as string,
    expertId: r.expert_id as string,
    expertName: (r.expert_name as string) ?? undefined,
    status: r.status as TaskStatus,
    deadline: (r.deadline as string) ?? undefined,
    expertBudget: r.expert_budget != null ? Number(r.expert_budget) : undefined,
    clientBudget: r.client_budget != null ? Number(r.client_budget) : undefined,
    currency: (r.currency as Currency) ?? undefined,
    deliveryLink: (r.delivery_link as string) ?? undefined,
    requirements: (r.requirements as string) ?? undefined,
    requirementLink: (r.requirement_link as string) ?? undefined,
    deliveryNotes: (r.delivery_notes as string) ?? undefined,
    revisionCount: r.revision_count != null ? Number(r.revision_count) : 0,
    revisionLink: (r.revision_link as string) ?? undefined,
  };
}

export interface NewTaskInput {
  title: string;
  description: string;
  expertId: string;
  expertName?: string;
  deadline?: string;
  expertBudget?: number;
  clientBudget?: number;
  currency?: Currency;
  orderId?: string;
  requirements?: string;
  requirementLink?: string;
}

/** Build the next task serial: TSK-YYYYMM-XXXX (resets monthly). */
async function nextTaskNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  let seq = 1;
  if (isSupabaseConfigured) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    try {
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart);
      seq = (count ?? 0) + 1;
    } catch {
      seq = 1;
    }
  }
  return `TSK-${ym}-${String(seq).padStart(4, "0")}`;
}

/** Admin: create + assign a task to an expert. */
export async function createTask(input: NewTaskInput): Promise<Task> {
  const taskNumber = await nextTaskNumber();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_number: taskNumber,
      title: input.title,
      description: input.description,
      expert_id: input.expertId,
      expert_name: input.expertName ?? null,
      deadline: input.deadline || null,
      expert_budget: input.expertBudget ?? null,
      client_budget: input.clientBudget ?? null,
      currency: input.currency ?? null,
      order_id: input.orderId ?? null,
      requirements: input.requirements ?? null,
      requirement_link: input.requirementLink ?? null,
      status: "assigned",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data);
}

/** Admin: every task across all experts, newest first (includes financials). */
export async function listAllTasks(): Promise<Task[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

export async function getTask(id: string): Promise<Task> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) throw error;
  return rowToTask(data);
}

/** Admin: advance a task (e.g. submitted → approved → completed). */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data);
}

/** Expert: their assigned tasks via the financial-safe view (no client budget). */
export async function listExpertTasks(): Promise<Task[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("expert_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

/** Expert: advance their own task (in_progress | submitted) via guarded RPC. */
export async function setMyTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase.rpc("set_task_status", {
    p_task_id: taskId,
    p_status: status,
  });
  if (error) throw error;
}

/** Expert: attach a final delivery link to their own task. */
export async function setMyTaskDelivery(taskId: string, link: string): Promise<void> {
  const { error } = await supabase.rpc("set_task_delivery", {
    p_task_id: taskId,
    p_link: link,
  });
  if (error) throw error;
}

/** Admin: list expert accounts available for assignment. */
export async function listExperts(): Promise<ExpertOption[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("role", "expert")
    .order("name");
  if (error) throw error;
  return (data ?? []) as ExpertOption[];
}

/** Next status for an expert acting on their own task (null if not theirs to move). */
export function expertNextStatus(status: TaskStatus): TaskStatus | null {
  if (status === "assigned") return "in_progress";
  if (status === "in_progress") return "submitted";
  if (status === "revision_requested") return "under_revision";
  if (status === "under_revision") return "submitted";
  return null;
}

/** Admin: send a task back to the expert with revision instructions + optional link. */
export async function requestRevision(task: Task, instructions: string, revisionLink?: string): Promise<Task> {
  if (!task.$id) throw new Error("Missing task id");
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "revision_requested",
      revision_count: (task.revisionCount ?? 0) + 1,
      revision_link: revisionLink || null,
    })
    .eq("id", task.$id)
    .select()
    .single();
  if (error) throw error;
  // Record the instructions in the task feedback thread.
  const { data: auth } = await supabase.auth.getUser();
  await supabase.from("task_feedback").insert({
    task_id: task.$id,
    author_id: auth.user?.id,
    author_role: "admin",
    kind: "revision",
    body: instructions,
  });
  return rowToTask(data);
}

/** Admin: deliver an approved task's work to the client's order. */
export async function deliverToClient(task: Task): Promise<Task> {
  if (!task.$id) throw new Error("Missing task id");
  if (task.orderId) {
    await supabase
      .from("orders")
      .update({ delivery_link: task.deliveryLink ?? null, status: "delivered" })
      .eq("id", task.orderId);
  }
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "delivered" })
    .eq("id", task.$id)
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data);
}

/** Admin: set delivery notes on a task. */
export async function setTaskDeliveryNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase.from("tasks").update({ delivery_notes: notes }).eq("id", id);
  if (error) throw error;
}

/** Next status for an admin acting on a task (null if terminal/expert-owned). */
export function adminNextStatus(status: TaskStatus): TaskStatus | null {
  if (status === "submitted") return "approved";
  if (status === "approved") return "delivered";
  if (status === "delivered") return "completed";
  return null;
}
