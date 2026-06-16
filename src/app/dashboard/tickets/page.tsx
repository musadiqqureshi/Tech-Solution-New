"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, LifeBuoy, X, Trash2, Check } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import {
  listSaasTickets, createSaasTicket, updateSaasTicket, deleteSaasTicket,
  listClients, type SaasTicket, type SaasClient,
} from "@/lib/saas";

const STATUS: Record<string, string> = { open: "#fbbf24", pending: "#a78bfa", closed: "#34d399" };
const PRIORITY: Record<string, string> = { low: "#6b7280", normal: "#60a5fa", high: "#fb923c", urgent: "#f87171" };

export default function TicketsPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [items, setItems] = useState<SaasTicket[]>([]);
  const [clients, setClients] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "", body: "", clientId: "", priority: "normal" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cid) return;
    Promise.all([listSaasTickets(cid), listClients(cid)]).then(([t, c]) => { setItems(t); setClients(c); }).catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  const clientName = (id?: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setBusy(true);
    try {
      const t = await createSaasTicket(cid, { subject: form.subject, body: form.body || undefined, clientId: form.clientId || undefined, priority: form.priority });
      setItems((x) => [t, ...x]); setForm({ subject: "", body: "", clientId: "", priority: "normal" }); setOpen(false);
    } finally { setBusy(false); }
  };
  const cycle = async (t: SaasTicket) => {
    const order = ["open", "pending", "closed"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    const u = await updateSaasTicket(t.id!, { status: next });
    setItems((x) => x.map((y) => (y.id === t.id ? u : y)));
  };
  const del = async (t: SaasTicket) => { await deleteSaasTicket(t.id!); setItems((x) => x.filter((y) => y.id !== t.id)); };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Support Tickets" subtitle="Client support in one place" />
        <button onClick={() => setOpen((o) => !o)} className="btn-primary !py-2 text-sm">{open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : "New Ticket"}</button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
          <input className={input} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className={input} rows={2} placeholder="Details (optional)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <select className={input} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">No client</option>
              {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <select className={input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.keys(PRIORITY).map((p) => (<option key={p} value={p} className="capitalize">{p}</option>))}
            </select>
          </div>
          <button type="submit" disabled={busy} className="btn-primary !py-2 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create</button>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center mt-4"><LifeBuoy size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No tickets yet.</p></div>
      ) : (
        <div className="space-y-3 mt-4">
          {items.map((t) => (
            <div key={t.id} className="glass-card p-5 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button onClick={() => cycle(t)} className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: `${STATUS[t.status]}22`, color: STATUS[t.status] }}>{t.status}</button>
                  <span className="text-[11px] font-semibold uppercase" style={{ color: PRIORITY[t.priority] }}>{t.priority}</span>
                </div>
                <h3 className="text-white font-semibold mt-1.5">{t.subject}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Client: {clientName(t.clientId)}</p>
                {t.body && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{t.body}</p>}
              </div>
              <button onClick={() => del(t)} className="btn-secondary !p-2 shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
