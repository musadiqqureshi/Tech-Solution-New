"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ListTodo, Check, BadgeCheck, X } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge } from "@/components/app/TaskBits";
import {
  listAllTasks, listExperts, createTask, updateTaskStatus,
  taskProfit, adminNextStatus,
} from "@/lib/tasks";
import { CURRENCIES, formatMoney } from "@/lib/orders";
import type { Task, ExpertOption, Currency } from "@/lib/types";

export default function AdminTasks() {
  useRequireRole(["admin"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState("");

  const load = () =>
    Promise.all([listAllTasks().catch(() => []), listExperts().catch(() => [])]).then(
      ([t, e]) => {
        setTasks(t);
        setExperts(e);
      }
    );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const advance = async (t: Task) => {
    const next = adminNextStatus(t.status);
    if (!next || !t.$id) return;
    setBusy(t.$id);
    try {
      const updated = await updateTaskStatus(t.$id, next);
      setTasks((prev) => prev.map((x) => (x.$id === updated.$id ? updated : x)));
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Task Management" subtitle="Assign work, set budgets, track profit" />
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary !py-2 text-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Close" : "Assign Task"}
        </button>
      </div>

      {showForm && (
        <AssignForm
          experts={experts}
          onCreated={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ListTodo size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No tasks yet. Assign one to an expert above.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {tasks.map((t) => {
            const profit = taskProfit(t);
            const next = adminNextStatus(t.status);
            return (
              <div key={t.$id} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {t.taskNumber && <span className="font-mono text-xs text-aura-cyan">{t.taskNumber}</span>}
                      <TaskBadge status={t.status} />
                      {t.deadline && (
                        <span className="text-[11px] text-gray-500">Due {t.deadline}</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mt-1.5">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Assigned to {t.expertName ?? "—"}</p>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-xs text-gray-500">
                      Expert: <span className="text-gray-300">{formatMoney(t.expertBudget, t.currency)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Client: <span className="text-gray-300">{formatMoney(t.clientBudget, t.currency)}</span>
                    </div>
                    {profit != null && (
                      <div className="text-sm font-bold text-emerald-400">
                        +{formatMoney(profit, t.currency)} profit
                      </div>
                    )}
                  </div>
                </div>
                {next && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <button onClick={() => advance(t)} disabled={!!busy} className="btn-primary !py-1.5 text-xs">
                      {busy === t.$id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : next === "approved" ? (
                        <Check size={14} />
                      ) : (
                        <BadgeCheck size={14} />
                      )}
                      {next === "approved" ? "Approve submission" : "Mark completed"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AssignForm({
  experts,
  onCreated,
}: {
  experts: ExpertOption[];
  onCreated: () => void;
}) {
  const [f, setF] = useState({
    title: "",
    description: "",
    expertId: "",
    deadline: "",
    expertBudget: "",
    clientBudget: "",
    currency: "USD" as Currency,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.title || !f.description || !f.expertId) return setError("Title, description and expert are required.");
    setSaving(true);
    try {
      const expert = experts.find((x) => x.id === f.expertId);
      await createTask({
        title: f.title,
        description: f.description,
        expertId: f.expertId,
        expertName: expert?.name,
        deadline: f.deadline || undefined,
        expertBudget: f.expertBudget ? Number(f.expertBudget) : undefined,
        clientBudget: f.clientBudget ? Number(f.clientBudget) : undefined,
        currency: f.currency,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

  return (
    <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
      <input className={input} placeholder="Task title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <textarea className={input} rows={3} placeholder="Description / scope" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <select className={input} value={f.expertId} onChange={(e) => setF({ ...f, expertId: e.target.value })}>
          <option value="">Select expert…</option>
          {experts.map((x) => (
            <option key={x.id} value={x.id}>{x.name}</option>
          ))}
        </select>
        <input className={input} type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <input className={input} type="number" placeholder="Expert budget" value={f.expertBudget} onChange={(e) => setF({ ...f, expertBudget: e.target.value })} />
        <input className={input} type="number" placeholder="Client budget" value={f.clientBudget} onChange={(e) => setF({ ...f, clientBudget: e.target.value })} />
        <select className={input} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Currency })}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary !py-2 text-sm">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create & Assign
      </button>
    </form>
  );
}
