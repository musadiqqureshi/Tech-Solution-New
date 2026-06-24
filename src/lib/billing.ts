import { supabase, isSupabaseConfigured } from "./supabase";
import { PLAN_PRICING } from "./constants";
import type { CompanyPlan } from "./saas";

export type BillingCycle = "monthly" | "yearly";
export type PlanInvoiceStatus = "unpaid" | "submitted" | "paid" | "void";

export interface PlanInvoice {
  id: string;
  companyId: string;
  number: string;
  plan: CompanyPlan;
  billingCycle: BillingCycle;
  amountUsd: number;
  fxRate: number;
  amountPkr: number;
  status: PlanInvoiceStatus;
  paymentProofUrl?: string;
  paymentSubmittedAt?: string;
  paidAt?: string;
  createdAt: string;
}

const YEARLY_MONTHS = 10; // pay 10, get 12 (mirrors PricingTables)
const PROOF_BUCKET = "payment-proofs";

function rowTo(r: Record<string, unknown>): PlanInvoice {
  return {
    id: r.id as string,
    companyId: r.company_id as string,
    number: r.number as string,
    plan: r.plan as CompanyPlan,
    billingCycle: r.billing_cycle as BillingCycle,
    amountUsd: Number(r.amount_usd),
    fxRate: Number(r.fx_rate),
    amountPkr: Number(r.amount_pkr),
    status: r.status as PlanInvoiceStatus,
    paymentProofUrl: (r.payment_proof_url as string) ?? undefined,
    paymentSubmittedAt: (r.payment_submitted_at as string) ?? undefined,
    paidAt: (r.paid_at as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

/** USD price for a plan + cycle (null for custom Enterprise). */
export function planUsd(plan: CompanyPlan, cycle: BillingCycle): number | null {
  const monthly = PLAN_PRICING[plan];
  if (monthly == null) return null;
  return cycle === "yearly" ? monthly * YEARLY_MONTHS : monthly;
}

/** Live USD→PKR rate from our cached API route. Falls back gracefully. */
export async function fetchUsdToPkr(): Promise<number> {
  try {
    const res = await fetch("/api/fx");
    const json = await res.json();
    if (typeof json?.rate === "number" && json.rate > 0) return json.rate;
  } catch {
    /* ignore */
  }
  return 278;
}

export async function listPlanInvoices(companyId: string): Promise<PlanInvoice[]> {
  if (!isSupabaseConfigured || !companyId) return [];
  const { data, error } = await supabase
    .from("plan_invoices")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

/** Generate a PKR invoice for a plan at the live FX rate. */
export async function createPlanInvoice(
  companyId: string,
  plan: CompanyPlan,
  cycle: BillingCycle
): Promise<PlanInvoice> {
  const usd = planUsd(plan, cycle);
  if (usd == null) throw new Error("Enterprise is custom-priced — contact sales.");
  const rate = await fetchUsdToPkr();
  const pkr = Math.round(usd * rate);
  const number = "TS-" + Date.now().toString(36).toUpperCase();
  const { data, error } = await supabase
    .from("plan_invoices")
    .insert({
      company_id: companyId,
      number,
      plan,
      billing_cycle: cycle,
      amount_usd: usd,
      fx_rate: rate,
      amount_pkr: pkr,
      status: "unpaid",
    })
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}

/** Upload a payment screenshot and mark the invoice as submitted. */
export async function submitPlanPayment(invoice: PlanInvoice, file: File): Promise<PlanInvoice> {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `plan-invoices/${invoice.id}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(PROOF_BUCKET).upload(path, file, { upsert: false });
  if (up.error) throw up.error;
  const { data: pub } = supabase.storage.from(PROOF_BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from("plan_invoices")
    .update({
      payment_proof_url: pub.publicUrl,
      payment_submitted_at: new Date().toISOString(),
      status: "submitted",
    })
    .eq("id", invoice.id)
    .select()
    .single();
  if (error) throw error;
  return rowTo(data);
}
