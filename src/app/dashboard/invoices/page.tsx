"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, FileText, X, Trash2, Check, Ban } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import {
  listSaasInvoices, createSaasInvoice, updateSaasInvoice, deleteSaasInvoice,
  listClients, type SaasInvoice, type SaasClient,
} from "@/lib/saas";

const STATUS: Record<string, string> = { unpaid: "#fbbf24", paid: "#34d399", void: "#6b7280" };

export default function InvoicesPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [items, setItems] = useState<SaasInvoice[]>([]);
  const [clients, setClients] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ clientId: "", number: "", amount: "", currency: "USD", dueDate: "" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cid) return;
    Promise.all([listSaasInvoices(cid), listClients(cid)]).then(([i, c]) => { setItems(i); setClients(c); }).catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  const clientName = (id?: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    setBusy(true);
    try {
      const inv = await createSaasInvoice(cid, { clientId: form.clientId || undefined, number: form.number || undefined, amount: Number(form.amount), currency: form.currency, dueDate: form.dueDate || undefined });
      setItems((x) => [inv, ...x]); setForm({ clientId: "", number: "", amount: "", currency: "USD", dueDate: "" }); setOpen(false);
    } finally { setBusy(false); }
  };
  const setStatus = async (i: SaasInvoice, status: string) => { const u = await updateSaasInvoice(i.id!, { status }); setItems((x) => x.map((y) => (y.id === i.id ? u : y))); };
  const del = async (i: SaasInvoice) => { await deleteSaasInvoice(i.id!); setItems((x) => x.filter((y) => y.id !== i.id)); };

  const paid = items.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
  const due = items.filter((i) => i.status === "unpaid").reduce((a, i) => a + i.amount, 0);
  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Invoices" subtitle="Bill clients and track payments" />
        <button onClick={() => setOpen((o) => !o)} className="btn-primary !py-2 text-sm">{open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : "New Invoice"}</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <div className="glass-card p-4"><p className="text-xs text-gray-500 uppercase tracking-widest">Collected</p><p className="text-xl font-black text-emerald-400">{paid.toLocaleString()}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-gray-500 uppercase tracking-widest">Outstanding</p><p className="text-xl font-black text-amber-400">{due.toLocaleString()}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-gray-500 uppercase tracking-widest">Invoices</p><p className="text-xl font-black text-white">{items.length}</p></div>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-card p-6 mt-4 grid sm:grid-cols-2 gap-4">
          <select className={input} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">No client</option>
            {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <input className={input} placeholder="Invoice # (optional)" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          <input className={input} type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className={input} placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <input className={input} type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button type="submit" disabled={busy} className="btn-primary !py-2 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create</button>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center mt-4"><FileText size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No invoices yet.</p></div>
      ) : (
        <div className="space-y-3 mt-4">
          {items.map((i) => (
            <div key={i.id} className="glass-card p-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  {i.number && <span className="font-mono text-xs text-aura-cyan">{i.number}</span>}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: `${STATUS[i.status]}22`, color: STATUS[i.status] }}>{i.status}</span>
                </div>
                <p className="text-white text-sm font-semibold mt-1">{clientName(i.clientId)}</p>
                {i.dueDate && <p className="text-xs text-gray-500">Due {i.dueDate}</p>}
              </div>
              <span className="text-white font-bold shrink-0">{i.currency ?? ""}{i.amount.toLocaleString()}</span>
              <div className="flex gap-2 shrink-0">
                {i.status !== "paid" && <button onClick={() => setStatus(i, "paid")} className="btn-secondary !p-2" title="Mark paid"><Check size={13} /></button>}
                {i.status !== "void" && <button onClick={() => setStatus(i, "void")} className="btn-secondary !p-2" title="Void"><Ban size={13} /></button>}
                <button onClick={() => del(i)} className="btn-secondary !p-2"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
