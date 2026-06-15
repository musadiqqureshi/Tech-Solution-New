import { supabase, isSupabaseConfigured } from "./supabase";
import type { Invoice, InvoiceStatus, InvoicePhase, Currency, Order } from "./types";

export const ADVANCE_PERCENT = 0.3; // 30% advance, 70% on final delivery

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  unpaid: { label: "Unpaid", color: "#fbbf24" },
  paid: { label: "Paid", color: "#34d399" },
  void: { label: "Void", color: "#6b7280" },
};

function rowToInvoice(r: Record<string, unknown>): Invoice {
  return {
    $id: r.id as string,
    $createdAt: r.created_at as string,
    invoiceNumber: r.invoice_number as string,
    orderId: (r.order_id as string) ?? undefined,
    clientId: r.client_id as string,
    clientName: r.client_name as string,
    clientEmail: r.client_email as string,
    description: r.description as string,
    amount: Number(r.amount),
    currency: (r.currency as Currency) ?? undefined,
    status: r.status as InvoiceStatus,
    issuedDate: (r.issued_date as string) ?? undefined,
    dueDate: (r.due_date as string) ?? undefined,
    source: (r.source as "manual" | "auto") ?? undefined,
    phase: (r.phase as InvoicePhase) ?? "full",
  };
}

/** Build the next invoice number: TSP-INV-YYYYMM-XXXX (resets monthly). */
async function nextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `TSP-INV-${ym}-`;
  let seq = 1;
  if (isSupabaseConfigured) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    try {
      const { count } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart);
      seq = (count ?? 0) + 1;
    } catch {
      seq = 1;
    }
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export interface NewInvoiceInput {
  clientId: string;
  clientName: string;
  clientEmail: string;
  description: string;
  amount: number;
  currency?: Currency;
  dueDate?: string;
  orderId?: string;
  source?: "manual" | "auto";
  phase?: InvoicePhase;
}

export async function createInvoice(input: NewInvoiceInput): Promise<Invoice> {
  const invoiceNumber = await nextInvoiceNumber();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      order_id: input.orderId ?? null,
      client_id: input.clientId,
      client_name: input.clientName,
      client_email: input.clientEmail,
      description: input.description,
      amount: input.amount,
      currency: input.currency ?? null,
      due_date: input.dueDate || null,
      source: input.source ?? "manual",
      phase: input.phase ?? "full",
      status: "unpaid",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToInvoice(data);
}

/** Admin: auto-generate a full-amount invoice from an existing order. */
export async function generateFromOrder(order: Order): Promise<Invoice> {
  return createInvoice({
    clientId: order.clientId,
    clientName: order.clientName,
    clientEmail: order.clientEmail,
    description: `${order.service} — ${order.title} (Order ${order.orderNumber})`,
    amount: order.budget ?? 0,
    currency: order.currency,
    orderId: order.$id,
    source: "auto",
    phase: "full",
  });
}

/**
 * Auto-generate a phased invoice (30% advance on approval, 70% on delivery).
 * Idempotent per order+phase so re-triggering won't duplicate.
 */
export async function generatePhaseInvoice(
  order: Order,
  phase: "advance" | "final"
): Promise<Invoice | null> {
  if (!order.$id || !order.budget) return null;
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("order_id", order.$id)
    .eq("phase", phase);
  if ((count ?? 0) > 0) return null; // already issued

  const pct = phase === "advance" ? ADVANCE_PERCENT : 1 - ADVANCE_PERCENT;
  const amount = Math.round((order.budget * pct + Number.EPSILON) * 100) / 100;
  const label = phase === "advance" ? "30% advance payment" : "70% final payment (on delivery)";
  return createInvoice({
    clientId: order.clientId,
    clientName: order.clientName,
    clientEmail: order.clientEmail,
    description: `${label} — ${order.title} (Order ${order.orderNumber})`,
    amount,
    currency: order.currency,
    orderId: order.$id,
    source: "auto",
    phase,
  });
}

export async function listClientInvoices(clientId: string): Promise<Invoice[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(rowToInvoice);
}

export async function listAllInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToInvoice);
}

/** Invoices linked to a specific order (client can read their own). */
export async function listOrderInvoices(orderId: string): Promise<Invoice[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToInvoice);
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
  if (error) throw error;
  return rowToInvoice(data);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToInvoice(data);
}
