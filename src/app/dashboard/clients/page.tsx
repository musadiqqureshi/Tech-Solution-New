"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Users, X, Pencil, Trash2, Check, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import { listClients, createClientRec, updateClientRec, deleteClientRec, type SaasClient } from "@/lib/saas";

const empty = { name: "", email: "", companyName: "", phone: "" };

export default function ClientsPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [items, setItems] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cid) return;
    listClients(cid).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, [cid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      if (editId) {
        const u = await updateClientRec(editId, form);
        setItems((p) => p.map((x) => (x.id === editId ? u : x)));
      } else {
        const c = await createClientRec(cid, form);
        setItems((p) => [c, ...p]);
      }
      setForm(empty); setEditId(null); setOpen(false);
    } finally { setBusy(false); }
  };

  const edit = (c: SaasClient) => { setForm({ name: c.name, email: c.email ?? "", companyName: c.companyName ?? "", phone: c.phone ?? "" }); setEditId(c.id!); setOpen(true); };
  const del = async (c: SaasClient) => { if (!confirm(`Delete ${c.name}?`)) return; await deleteClientRec(c.id!); setItems((p) => p.filter((x) => x.id !== c.id)); };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Clients" subtitle="Your company's clients" />
        <button onClick={() => { setForm(empty); setEditId(null); setOpen((o) => !o); }} className="btn-primary !py-2 text-sm">
          {open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : "Add Client"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input className={input} placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={input} placeholder="Company (optional)" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <input className={input} placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={input} placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary !py-2 text-sm">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {editId ? "Save" : "Add Client"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center mt-4"><Users size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No clients yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {items.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30 grid place-items-center text-white font-bold shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold truncate">{c.name}</h3>
                  {c.companyName && <p className="text-xs text-gray-400">{c.companyName}</p>}
                  {c.email && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Mail size={12} /> {c.email}</p>}
                  {c.phone && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Phone size={12} /> {c.phone}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => edit(c)} className="btn-secondary !p-2"><Pencil size={13} /></button>
                  <button onClick={() => del(c)} className="btn-secondary !p-2"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
