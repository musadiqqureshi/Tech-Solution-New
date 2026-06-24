import { supabase, isSupabaseConfigured } from "./supabase";
import { updateOrder } from "./orders";
import type { Currency, Order } from "./types";

export type ProposalStatus = "submitted" | "countered" | "approved" | "rejected";

export interface Proposal {
  id: string;
  orderId: string;
  authorId: string;
  authorName?: string;
  scope: string;
  price: number;
  currency: Currency;
  deadline?: string;
  status: ProposalStatus;
  clientPrice?: number;
  clientDeadline?: string;
  clientNote?: string;
  revisionNote?: string;
  createdAt: string;
  updatedAt: string;
}

function rowTo(r: Record<string, unknown>): Proposal {
  return {
    id: r.id as string,
    orderId: r.order_id as string,
    authorId: r.author_id as string,
    authorName: (r.author_name as string) ?? undefined,
    scope: r.scope as string,
    price: Number(r.price),
    currency: r.currency as Currency,
    deadline: (r.deadline as string) ?? undefined,
    status: r.status as ProposalStatus,
    clientPrice: r.client_price != null ? Number(r.client_price) : undefined,
    clientDeadline: (r.client_deadline as string) ?? undefined,
    clientNote: (r.client_note as string) ?? undefined,
    revisionNote: (r.revision_note as string) ?? undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function listProposals(orderId: string): Promise<Proposal[]> {
  if (!isSupabaseConfigured || !orderId) return [];
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

/** Team (admin) submits a proposal for the project. */
export async function createProposal(input: {
  orderId: string;
  authorId: string;
  authorName?: string;
  scope: string;
  price: number;
  currency: Currency;
  deadline?: string;
}): Promise<Proposal> {
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      order_id: input.orderId,
      author_id: input.authorId,
      author_name: input.authorName ?? null,
      scope: input.scope,
      price: input.price,
      currency: input.currency,
      deadline: input.deadline || null,
      status: "submitted",
    })
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}

/** Client negotiates: counter the price and/or deadline with an optional note. */
export async function counterProposal(
  id: string,
  input: { clientPrice?: number; clientDeadline?: string; clientNote?: string }
): Promise<Proposal> {
  const { data, error } = await supabase
    .from("proposals")
    .update({
      client_price: input.clientPrice ?? null,
      client_deadline: input.clientDeadline || null,
      client_note: input.clientNote ?? null,
      status: "countered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}

/** Client requests a revision to the team on a submitted proposal. */
export async function requestProposalRevision(id: string, note: string): Promise<Proposal> {
  const { data, error } = await supabase
    .from("proposals")
    .update({ revision_note: note, status: "countered", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}

/** Client approves the proposal → the project officially starts. */
export async function approveProposal(proposal: Proposal): Promise<{ proposal: Proposal; order: Order }> {
  const { data, error } = await supabase
    .from("proposals")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", proposal.id)
    .select()
    .single();
  if (error) throw error;
  // Officially start the project.
  const order = await updateOrder(proposal.orderId, { status: "in_progress" });
  return { proposal: rowTo(data), order };
}

export async function rejectProposal(id: string): Promise<Proposal> {
  const { data, error } = await supabase
    .from("proposals")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}
