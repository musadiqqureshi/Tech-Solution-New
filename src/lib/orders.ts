import { supabase, isSupabaseConfigured } from "./supabase";
import type { Order, OrderStatus, Currency } from "./types";

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "PKR", symbol: "₨", label: "Pakistani Rupee" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; step: number }
> = {
  pending: { label: "Pending Review", color: "#fbbf24", step: 0 },
  approved: { label: "Approved", color: "#60a5fa", step: 1 },
  in_progress: { label: "In Progress", color: "#a78bfa", step: 2 },
  delivered: { label: "Delivered", color: "#22d3ee", step: 3 },
  completed: { label: "Completed", color: "#34d399", step: 4 },
  rejected: { label: "Rejected", color: "#f87171", step: -1 },
};

/** Ordered status flow for the progress timeline (excludes rejected). */
export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "approved",
  "in_progress",
  "delivered",
  "completed",
];

export function formatMoney(amount?: number, currency?: Currency): string {
  if (amount == null) return "—";
  const c = CURRENCIES.find((x) => x.code === currency);
  return `${c?.symbol ?? ""}${amount.toLocaleString()}`;
}

/** Map a Supabase orders row to the Order shape used by the UI. */
function rowToOrder(r: Record<string, unknown>): Order {
  return {
    $id: r.id as string,
    $createdAt: r.created_at as string,
    orderNumber: r.order_number as string,
    clientId: r.client_id as string,
    clientName: r.client_name as string,
    clientEmail: r.client_email as string,
    service: r.service as string,
    title: r.title as string,
    description: r.description as string,
    requirements: (r.requirements as string) ?? undefined,
    budget: r.budget != null ? Number(r.budget) : undefined,
    currency: (r.currency as Currency) ?? undefined,
    status: r.status as OrderStatus,
    paid: (r.paid as boolean) ?? false,
    deliveryLink: (r.delivery_link as string) ?? undefined,
    followUp: (r.follow_up as string) ?? undefined,
  };
}

/** Build the next order number: TSP-YYYYMM-XXXX (sequence resets monthly). */
async function nextOrderNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `TSP-${ym}-`;
  let seq = 1;
  if (isSupabaseConfigured) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    try {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart);
      seq = (count ?? 0) + 1;
    } catch {
      seq = 1;
    }
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export interface NewOrderInput {
  clientId: string;
  clientName: string;
  clientEmail: string;
  service: string;
  title: string;
  description: string;
  requirements?: string;
  budget?: number;
  currency?: Currency;
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const orderNumber = await nextOrderNumber();

  if (!isSupabaseConfigured) {
    console.info("[dev] Order created (Supabase not configured):", input);
    return {
      ...input,
      orderNumber,
      status: "pending",
      paid: false,
      $id: "dev",
      $createdAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      client_id: input.clientId,
      client_name: input.clientName,
      client_email: input.clientEmail,
      service: input.service,
      title: input.title,
      description: input.description,
      requirements: input.requirements ?? null,
      budget: input.budget ?? null,
      currency: input.currency ?? null,
      status: "pending",
      paid: false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

export async function listClientOrders(clientId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export async function getOrder(id: string): Promise<Order> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) throw error;
  return rowToOrder(data);
}

/** Admin: list every order across all clients, newest first. */
export async function listAllOrders(status?: OrderStatus): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

/** Admin: update an order's status and/or payment flag. */
export async function updateOrder(
  id: string,
  fields: Partial<Pick<Order, "status" | "paid">>
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

/** Admin: set the final delivery link for the client. */
export async function setOrderDelivery(id: string, link: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ delivery_link: link || null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

/** Client: request a follow-up on their order (optional reference link/note). */
export async function setOrderFollowUp(id: string, followUp: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ follow_up: followUp || null, follow_up_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

/** The status an order advances to next (null if terminal). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const order: OrderStatus[] = ["approved", "in_progress", "delivered", "completed"];
  const idx = order.indexOf(status);
  if (status === "pending") return "approved";
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
  return null;
}
