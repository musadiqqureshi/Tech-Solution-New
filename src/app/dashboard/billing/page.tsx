"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CreditCard, Landmark, Upload, CheckCircle2, Receipt, Copy } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import { PLAN_LABEL } from "@/lib/saas";
import { BANK } from "@/lib/constants";
import {
  listPlanInvoices, createPlanInvoice, submitPlanPayment, planUsd, fetchUsdToPkr,
  type PlanInvoice, type BillingCycle,
} from "@/lib/billing";

const pkr = (n: number) => "Rs " + Math.round(n).toLocaleString("en-PK");

const STATUS_STYLE: Record<string, string> = {
  unpaid: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  submitted: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  void: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function BillingPage() {
  const company = useCompany();
  const [invoices, setInvoices] = useState<PlanInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [rate, setRate] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const plan = company?.plan ?? "starter";
  const usd = planUsd(plan, cycle);
  const isEnterprise = usd == null;

  useEffect(() => {
    if (!company?.id) return;
    listPlanInvoices(company.id).then(setInvoices).catch(() => {}).finally(() => setLoading(false));
    fetchUsdToPkr().then(setRate).catch(() => {});
  }, [company?.id]);

  const generate = async () => {
    if (!company?.id || isEnterprise) return;
    setCreating(true);
    setError("");
    try {
      const inv = await createPlanInvoice(company.id, plan, cycle);
      setInvoices((p) => [inv, ...p]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invoice.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageHeader title="Billing" subtitle="Subscribe and pay for your workspace" />

      {/* Plan + checkout */}
      <div className="glass-card p-6 max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Current plan</p>
            <p className="mt-1 text-2xl font-black text-white">{PLAN_LABEL[plan]}</p>
            <p className="text-sm text-aura-cyan capitalize">{company?.status}</p>
          </div>
          <div className="inline-flex rounded-xl border border-white/10 p-1 bg-white/5">
            {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  cycle === c ? "bg-gradient-to-r from-aura-purple to-aura-cyan text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {c}{c === "yearly" && " · 2 mo free"}
              </button>
            ))}
          </div>
        </div>

        {isEnterprise ? (
          <p className="mt-5 text-sm text-gray-400">
            Enterprise is custom-priced. Use Tech Solutions AI to talk to sales about your plan.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">
                ${usd?.toFixed(2)} {cycle === "yearly" ? "/ year" : "/ month"}
                {rate && <span className="text-gray-500"> · @ {rate.toFixed(2)} PKR/USD (live)</span>}
              </p>
              <p className="text-3xl font-black gradient-text mt-1">
                {rate ? pkr((usd ?? 0) * rate) : "…"}
              </p>
            </div>
            <button onClick={generate} disabled={creating} className="btn-primary disabled:opacity-60">
              {creating ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
              Generate invoice
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {/* Bank details */}
      <div className="glass-card p-6 max-w-3xl mt-5">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-aura-cyan" />
          <h3 className="text-sm font-bold text-white">Bank account for payment</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <BankRow label="Bank" value={BANK.bankName} />
          <BankRow label="Account title" value={BANK.accountTitle} />
          <BankRow label="Account number" value={BANK.accountNumber} copy />
          <BankRow label="IBAN" value={BANK.iban} copy />
          <BankRow label="Branch" value={BANK.branch} />
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Transfer the invoice amount to this account, then upload your payment screenshot on the
          invoice below. We verify and activate your plan within one business day.
        </p>
      </div>

      {/* Invoices */}
      <h3 className="text-sm font-bold text-white mt-8 mb-3 flex items-center gap-2">
        <CreditCard size={16} className="text-aura-purple" /> Invoices
      </h3>
      {loading ? (
        <Loader2 className="animate-spin text-aura-cyan" />
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500">No invoices yet. Generate one above to subscribe.</p>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onPaid={(updated) => setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)))}
            />
          ))}
        </div>
      )}
    </>
  );
}

function BankRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-white font-medium flex items-center gap-2">
        {value}
        {copy && (
          <button
            onClick={() => { navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }}
            className="text-gray-400 hover:text-white"
            aria-label={`Copy ${label}`}
          >
            {done ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        )}
      </p>
    </div>
  );
}

function InvoiceCard({ invoice, onPaid }: { invoice: PlanInvoice; onPaid: (i: PlanInvoice) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const updated = await submitPlanPayment(invoice, file);
      onPaid(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-white font-bold">{invoice.number}</p>
          <p className="text-xs text-gray-500 capitalize">
            {PLAN_LABEL[invoice.plan]} · {invoice.billingCycle} · ${invoice.amountUsd.toFixed(2)} @ {invoice.fxRate.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black gradient-text">{pkr(invoice.amountPkr)}</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLE[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {invoice.status === "unpaid" && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Paid via bank transfer? Upload your screenshot:</p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary !py-2 text-sm disabled:opacity-60">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload payment screenshot
          </button>
          {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
        </div>
      )}

      {invoice.status === "submitted" && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-blue-300">
          <CheckCircle2 size={16} /> Payment proof received — pending verification.
          {invoice.paymentProofUrl && (
            <a href={invoice.paymentProofUrl} target="_blank" rel="noreferrer" className="text-aura-cyan hover:underline ml-1">View</a>
          )}
        </div>
      )}

      {invoice.status === "paid" && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> Paid — thank you!
        </div>
      )}
    </div>
  );
}
