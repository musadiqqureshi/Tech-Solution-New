"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, FolderKanban, X, Trash2, Check, Calendar } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import {
  listProjects, createProject, updateProject, deleteProject,
  listClients, type SaasProject, type SaasClient,
} from "@/lib/saas";

const STATUS: Record<string, string> = { active: "#a78bfa", on_hold: "#fbbf24", completed: "#34d399", cancelled: "#f87171" };
const empty = { name: "", clientId: "", description: "", deadline: "", budget: "", currency: "USD" };

export default function ProjectsPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [items, setItems] = useState<SaasProject[]>([]);
  const [clients, setClients] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cid) return;
    Promise.all([listProjects(cid), listClients(cid)]).then(([p, c]) => { setItems(p); setClients(c); }).catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  const clientName = (id?: string) => clients.find((c) => c.id === id)?.name ?? "—";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const p = await createProject(cid, { name: form.name, clientId: form.clientId || undefined, description: form.description || undefined, deadline: form.deadline || undefined, budget: form.budget ? Number(form.budget) : undefined, currency: form.currency });
      setItems((x) => [p, ...x]); setForm(empty); setOpen(false);
    } finally { setBusy(false); }
  };
  const cycle = async (p: SaasProject) => {
    const order = ["active", "on_hold", "completed", "cancelled"];
    const next = order[(order.indexOf(p.status) + 1) % order.length];
    const u = await updateProject(p.id!, { status: next });
    setItems((x) => x.map((y) => (y.id === p.id ? u : y)));
  };
  const del = async (p: SaasProject) => { if (!confirm(`Delete ${p.name}?`)) return; await deleteProject(p.id!); setItems((x) => x.filter((y) => y.id !== p.id)); };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Projects" subtitle="Track your company's projects" />
        <button onClick={() => setOpen((o) => !o)} className="btn-primary !py-2 text-sm">{open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : "New Project"}</button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
          <input className={input} placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className={input} rows={2} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <select className={input} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">No client</option>
              {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <input className={input} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <input className={input} type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <input className={input} placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary !py-2 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create</button>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center mt-4"><FolderKanban size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No projects yet.</p></div>
      ) : (
        <div className="space-y-3 mt-4">
          {items.map((p) => (
            <div key={p.id} className="glass-card p-5 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button onClick={() => cycle(p)} className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: `${STATUS[p.status]}22`, color: STATUS[p.status] }}>{p.status.replace("_", " ")}</button>
                  {p.deadline && <span className="text-[11px] text-gray-500 flex items-center gap-1"><Calendar size={12} /> {p.deadline}</span>}
                </div>
                <h3 className="text-white font-semibold mt-1.5">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Client: {clientName(p.clientId)}{p.budget ? ` · ${p.currency ?? ""}${p.budget}` : ""}</p>
                {p.description && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.description}</p>}
              </div>
              <button onClick={() => del(p)} className="btn-secondary !p-2 shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
