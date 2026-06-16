"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ListChecks, X, Trash2, Check } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import {
  listSaasTasks, createSaasTask, updateSaasTask, deleteSaasTask,
  listProjects, listMembers, type SaasTask, type SaasProject, type CompanyMember,
} from "@/lib/saas";

const COLS: { key: string; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "#fbbf24" },
  { key: "in_progress", label: "In Progress", color: "#a78bfa" },
  { key: "done", label: "Done", color: "#34d399" },
];

export default function TasksPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [items, setItems] = useState<SaasTask[]>([]);
  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", projectId: "", assigneeId: "", deadline: "" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!cid) return;
    Promise.all([listSaasTasks(cid), listProjects(cid), listMembers(cid)])
      .then(([t, p, m]) => { setItems(t); setProjects(p); setMembers(m); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  const memberName = (id?: string) => members.find((m) => m.userId === id)?.name ?? "Unassigned";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const t = await createSaasTask(cid, { title: form.title, projectId: form.projectId || undefined, assigneeId: form.assigneeId || undefined, deadline: form.deadline || undefined });
      setItems((x) => [t, ...x]); setForm({ title: "", projectId: "", assigneeId: "", deadline: "" }); setOpen(false);
    } finally { setBusy(false); }
  };
  const move = async (t: SaasTask, status: string) => {
    const u = await updateSaasTask(t.id!, { status });
    setItems((x) => x.map((y) => (y.id === t.id ? u : y)));
  };
  const del = async (t: SaasTask) => { await deleteSaasTask(t.id!); setItems((x) => x.filter((y) => y.id !== t.id)); };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Tasks" subtitle="Plan and track your team's work" />
        <button onClick={() => setOpen((o) => !o)} className="btn-primary !py-2 text-sm">{open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : "New Task"}</button>
      </div>

      {open && (
        <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
          <input className={input} placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid sm:grid-cols-3 gap-4">
            <select className={input} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">No project</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <select className={input} value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (<option key={m.userId} value={m.userId}>{m.name ?? m.email}</option>))}
            </select>
            <input className={input} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary !py-2 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Add Task</button>
        </form>
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {COLS.map((col) => (
            <div key={col.key} className="glass-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: col.color }}>
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} /> {col.label} ({items.filter((t) => t.status === col.key).length})
              </h3>
              <div className="space-y-2">
                {items.filter((t) => t.status === col.key).map((t) => (
                  <div key={t.id} className="rounded-lg bg-white/5 p-3">
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-white flex-1">{t.title}</p>
                      <button onClick={() => del(t)} className="text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{memberName(t.assigneeId)}{t.deadline ? ` · ${t.deadline}` : ""}</p>
                    <div className="flex gap-1 mt-2">
                      {COLS.filter((c) => c.key !== t.status).map((c) => (
                        <button key={c.key} onClick={() => move(t, c.key)} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400 hover:text-white">→ {c.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
