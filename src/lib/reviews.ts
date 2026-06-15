import { supabase, isSupabaseConfigured } from "./supabase";
import type { Review } from "./types";

function rowToReview(r: Record<string, unknown>): Review {
  return {
    $id: r.id as string,
    $createdAt: r.created_at as string,
    orderId: (r.order_id as string) ?? undefined,
    clientId: r.client_id as string,
    clientName: r.client_name as string,
    rating: Number(r.rating),
    comment: (r.comment as string) ?? undefined,
    approved: Boolean(r.approved),
  };
}

export interface NewReviewInput {
  orderId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment?: string;
}

export async function submitReview(input: NewReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: input.orderId,
      client_id: input.clientId,
      client_name: input.clientName,
      rating: input.rating,
      comment: input.comment ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReview(data);
}

/** The current client's review for a given order (if any). */
export async function getMyOrderReview(orderId: string, clientId: string): Promise<Review | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .eq("client_id", clientId)
    .limit(1);
  return data && data.length ? rowToReview(data[0]) : null;
}

export async function listAllReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToReview);
}

/** Public: approved reviews for homepage testimonials. */
export async function listApprovedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map(rowToReview);
}

export async function setReviewApproved(id: string, approved: boolean): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update({ approved })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToReview(data);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
