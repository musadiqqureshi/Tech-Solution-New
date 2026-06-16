"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, ListTodo, X, ArrowRight } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge } from "@/components/app/TaskBits";
import { listAllTasks, listExperts, createTask, taskProfit } from "@/lib/tasks";
import { listAllOrders, CURRENCIES, formatMoney } from "@/lib/orders";
import type { Task, ExpertOption, Currency, Order } from "@/lib/types";

export default function AdminTasks() {
  useRequireRole(["admin"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    Promise.all([
      listAllTasks().catch(() => []),
      listExperts().catch(() => []),
      listAllOrders().catch(() => []),
    ]).then(([t, e, o]) => {
      setTasks(t);
      setExperts(e);
      setOrders(o);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Task Management" subtitle="Assign work, review submissions, track profit" />
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary !py-2 text-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Close" : "Assign Task"}
        </button>
      </div>

      {showForm && (
        <AssignForm
          experts={experts}
          orders={orders}
          onCreated={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ListTodo size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No tasks yet. Assign one to an expert above.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {tasks.map((t) => {
            const profit = taskProfit(t);
            return (
              <Link key={t.$id} href={`/app/admin/tasks/${t.$id}`} className="glass-card glass-card-hover p-5 flex items-start gap-4 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {t.taskNumber && <span className="font-mono text-xs text-aura-cyan">{t.taskNumber}</span>}
                    <TaskBadge status={t.status} />
                    {t.deadline && <span className="text-[11px] text-gray-500">Due {t.deadline}</span>}
                    {(t.revisionCount ?? 0) > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">{t.revisionCount} rev</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mt-1.5">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Assigned to {t.expertName ?? "—"}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  {profit != null && <div className="text-sm font-bold text-emerald-400">+{formatMoney(profit, t.currency)}</div>}
                  <div className="text-xs text-gray-500">{formatMoney(t.clientBudget, t.currency)}</div>
                </div>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function AssignForm({
  experts,
  orders,
  onCreated,
}: {
  experts: ExpertOption[];
  orders: Order[];
  onCreated: () => void;
}) {
  const [f, setF] = useState({
    orderId: "",
    title: "",
    description: "",
    requirements: "",
    requirementLink: "",
    service: "",
    expertId: "",
    deadline: "",
    salaried: false,
    expertBudget: "",
    clientBudget: "",
    currency: "USD" as Currency,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Show experts whose specialty matches the order's service; fall back to all.
  const relevant = f.service ? experts.filter((e) => e.specialty === f.service) : [];
  const expertOptions = relevant.length > 0 ? relevant : experts;

  // Selecting an order auto-fills task details (NOT client name or budget).
  const pickOrder = (orderId: string) => {
    const o = orders.find((x) => x.$id === orderId);
    if (!o) {
      setF((s) => ({ ...s, orderId: "" }));
      return;
    }
    setF((s) => ({
      ...s,
      orderId,
      title: o.title,
      description: o.description,
      requirements: o.requirements ?? "",
      requirementLink: o.requirementLink ?? "",
      service: o.service ?? "",
      expertId: "", // reset so the admin re-picks from the relevant experts
      currency: o.currency ?? s.currency,
      deadline: o.deadline ?? s.deadline,
    }));
  };

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
        requirements: f.requirements || undefined,
        requirementLink: f.requirementLink || undefined,
        expertId: f.expertId,
        expertName: expert?.name,
        orderId: f.orderId || undefined,
        deadline: f.deadline || undefined,
        salaried: f.salaried,
        expertBudget: f.salaried ? undefined : f.expertBudget ? Number(f.expertBudget) : undefined,
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
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Link to order (auto-fills details)</label>
        <select className={`${input} mt-1.5`} value={f.orderId} onChange={(e) => pickOrder(e.target.value)}>
          <option value="">No order — manual task</option>
          {orders.map((o) => (
            <option key={o.$id} value={o.$id}>{o.orderNumber} — {o.title} ({o.clientName})</option>
          ))}
        </select>
      </div>
      <input className={input} placeholder="Task title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <textarea className={input} rows={3} placeholder="Description / scope" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      <textarea className={input} rows={2} placeholder="Requirements (optional)" value={f.requirements} onChange={(e) => setF({ ...f, requirements: e.target.value })} />
      <input className={input} placeholder="Requirement files / source link (GitHub/Drive/OneDrive)" value={f.requirementLink} onChange={(e) => setF({ ...f, requirementLink: e.target.value })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <select className={input} value={f.expertId} onChange={(e) => setF({ ...f, expertId: e.target.value })}>
            <option value="">Select expert…</option>
            {expertOptions.map((x) => (
              <option key={x.id} value={x.id}>{x.name}{x.specialty ? ` · ${x.specialty}` : ""}</option>
            ))}
          </select>
          {f.service && (
            <p className="text-[11px] text-gray-500 mt-1">
              {relevant.length > 0
                ? `Showing experts for ${f.service}`
                : `No specialist for ${f.service} — showing all experts`}
            </p>
          )}
        </div>
        <input className={input} type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input type="checkbox" checked={f.salaried} onChange={(e) => setF({ ...f, salaried: e.target.checked })} />
        Salaried expert (paid via payroll — no per-task budget)
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        {!f.salaried && (
          <input className={input} type="number" placeholder="Expert budget" value={f.expertBudget} onChange={(e) => setF({ ...f, expertBudget: e.target.value })} />
        )}
        <input className={input} type="number" placeholder="Client budget" value={f.clientBudget} onChange={(e) => setF({ ...f, clientBudget: e.target.value })} />
        <select className={input} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Currency })}>
          {CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary !py-2 text-sm">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create & Assign
      </button>
    </form>
  );
}
