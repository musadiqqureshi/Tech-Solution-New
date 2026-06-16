"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Wallet, FileText, Check, Ban, Zap, X, ArrowRight, Users, Trash2 } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { InvoiceBadge } from "@/components/app/InvoiceDocument";
import {
  listAllInvoices, createInvoice, generateFromOrder, updateInvoiceStatus,
} from "@/lib/invoices";
import { listAllOrders, CURRENCIES, formatMoney } from "@/lib/orders";
import { listExperts } from "@/lib/tasks";
import { listSalaries, addSalary, setSalaryPaid, deleteSalary } from "@/lib/salaries";
import type { Invoice, Order, Currency, ExpertOption, Salary } from "@/lib/types";

export default function AdminInvoices() {
  useRequireRole(["admin"]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState("");

  const load = () =>
    Promise.all([listAllInvoices().catch(() => []), listAllOrders().catch(() => [])]).then(
      ([inv, ord]) => {
        setInvoices(inv);
        setOrders(ord);
      }
    );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setStatus = async (inv: Invoice, status: Invoice["status"]) => {
    if (!inv.$id) return;
    setBusy(inv.$id);
    try {
      const updated = await updateInvoiceStatus(inv.$id, status);
      setInvoices((prev) => prev.map((x) => (x.$id === updated.$id ? updated : x)));
    } finally {
      setBusy("");
    }
  };

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.amount, 0);
  const cur = invoices.find((i) => i.currency)?.currency;

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Invoice Management" subtitle="Automatic and manual invoices" />
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary !py-2 text-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Close" : "New Invoice"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Collected</p>
          <p className="text-xl font-black text-emerald-400">{formatMoney(totalPaid, cur)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Outstanding</p>
          <p className="text-xl font-black text-amber-400">{formatMoney(totalUnpaid, cur)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Invoices</p>
          <p className="text-xl font-black text-white">{invoices.length}</p>
        </div>
      </div>

      {showForm && (
        <CreatePanel
          orders={orders}
          onDone={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Wallet size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No invoices yet. Create one or generate from an order.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {invoices.map((inv) => (
            <div key={inv.$id} className="glass-card p-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{inv.invoiceNumber}</span>
                  <InvoiceBadge status={inv.status} />
                  {inv.source === "auto" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-aura-purple/15 text-aura-purple">auto</span>
                  )}
                </div>
                <p className="text-white text-sm font-semibold mt-1 truncate">{inv.clientName}</p>
                <p className="text-xs text-gray-500 truncate">{inv.description}</p>
              </div>
              <span className="text-white font-bold shrink-0">{formatMoney(inv.amount, inv.currency)}</span>
              <div className="flex items-center gap-2 shrink-0">
                {inv.status !== "paid" && (
                  <button onClick={() => setStatus(inv, "paid")} disabled={!!busy} title="Mark paid" className="btn-secondary !p-2">
                    {busy === inv.$id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                )}
                {inv.status !== "void" && (
                  <button onClick={() => setStatus(inv, "void")} disabled={!!busy} title="Void" className="btn-secondary !p-2">
                    <Ban size={14} />
                  </button>
                )}
                <Link href={`/app/admin/invoices/${inv.$id}`} className="btn-secondary !p-2" title="View">
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <SalariesPanel />
    </>
  );
}

function CreatePanel({ orders, onDone }: { orders: Order[]; onDone: () => void }) {
  const [tab, setTab] = useState<"order" | "manual">("order");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [m, setM] = useState({ clientId: "", clientName: "", clientEmail: "", description: "", amount: "", currency: "USD" as Currency, dueDate: "" });

  const fromOrder = async () => {
    const order = orders.find((o) => o.$id === orderId);
    if (!order) return setError("Pick an order.");
    setBusy(true);
    setError("");
    try {
      await generateFromOrder(order);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  };

  const manual = async () => {
    if (!m.clientId || !m.clientName || !m.clientEmail || !m.description || !m.amount)
      return setError("All fields except due date are required (client ID is the user's UUID).");
    setBusy(true);
    setError("");
    try {
      await createInvoice({
        clientId: m.clientId,
        clientName: m.clientName,
        clientEmail: m.clientEmail,
        description: m.description,
        amount: Number(m.amount),
        currency: m.currency,
        dueDate: m.dueDate || undefined,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

  return (
    <div className="glass-card p-6 mt-4 mb-2">
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("order")} className={`text-xs px-3 py-1.5 rounded-full border ${tab === "order" ? "bg-aura-purple/20 border-aura-purple/50 text-white" : "border-white/10 text-gray-400"}`}>
          From Order
        </button>
        <button onClick={() => setTab("manual")} className={`text-xs px-3 py-1.5 rounded-full border ${tab === "manual" ? "bg-aura-purple/20 border-aura-purple/50 text-white" : "border-white/10 text-gray-400"}`}>
          Manual
        </button>
      </div>

      {tab === "order" ? (
        <div className="space-y-4">
          <select className={input} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">Select an order…</option>
            {orders.map((o) => (
              <option key={o.$id} value={o.$id}>
                {o.orderNumber} — {o.clientName} — {formatMoney(o.budget, o.currency)}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={fromOrder} disabled={busy} className="btn-primary !py-2 text-sm">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Generate Invoice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input className={input} placeholder="Client user ID (UUID)" value={m.clientId} onChange={(e) => setM({ ...m, clientId: e.target.value })} />
            <input className={input} placeholder="Client name" value={m.clientName} onChange={(e) => setM({ ...m, clientName: e.target.value })} />
          </div>
          <input className={input} placeholder="Client email" value={m.clientEmail} onChange={(e) => setM({ ...m, clientEmail: e.target.value })} />
          <input className={input} placeholder="Description" value={m.description} onChange={(e) => setM({ ...m, description: e.target.value })} />
          <div className="grid sm:grid-cols-3 gap-4">
            <input className={input} type="number" placeholder="Amount" value={m.amount} onChange={(e) => setM({ ...m, amount: e.target.value })} />
            <select className={input} value={m.currency} onChange={(e) => setM({ ...m, currency: e.target.value as Currency })}>
              {CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
            </select>
            <input className={input} type="date" value={m.dueDate} onChange={(e) => setM({ ...m, dueDate: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={manual} disabled={busy} className="btn-primary !py-2 text-sm">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Create Invoice
          </button>
        </div>
      )}
    </div>
  );
}

function SalariesPanel() {
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [f, setF] = useState({ expertId: "", amount: "", currency: "USD" as Currency, period: thisMonth, note: "" });

  const load = () =>
    Promise.all([listExperts().catch(() => []), listSalaries().catch(() => [])]).then(([e, s]) => {
      setExperts(e);
      setSalaries(s);
    });
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const add = async () => {
    const expert = experts.find((x) => x.id === f.expertId);
    if (!expert || !f.amount) return;
    setBusy("add");
    try {
      const s = await addSalary({
        expertId: expert.id,
        expertName: expert.name,
        amount: Number(f.amount),
        currency: f.currency,
        period: f.period,
        note: f.note || undefined,
      });
      setSalaries((p) => [s, ...p]);
      setF({ ...f, amount: "", note: "" });
    } finally {
      setBusy("");
    }
  };

  const togglePaid = async (s: Salary) => {
    if (!s.$id) return;
    setBusy(s.$id);
    try {
      const u = await setSalaryPaid(s.$id, !s.paid);
      setSalaries((p) => p.map((x) => (x.$id === u.$id ? u : x)));
    } finally {
      setBusy("");
    }
  };

  const remove = async (s: Salary) => {
    if (!s.$id || !confirm(`Delete salary entry for ${s.expertName}?`)) return;
    setBusy(s.$id);
    try {
      await deleteSalary(s.$id);
      setSalaries((p) => p.filter((x) => x.$id !== s.$id));
    } finally {
      setBusy("");
    }
  };

  const paidTotal = salaries.filter((s) => s.paid).reduce((a, s) => a + s.amount, 0);
  const pendingTotal = salaries.filter((s) => !s.paid).reduce((a, s) => a + s.amount, 0);
  const cur = salaries.find((s) => s.currency)?.currency;
  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-aura-cyan" />
        <h2 className="text-lg font-black text-white">Salary Management</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Paid Payroll</p>
          <p className="text-xl font-black text-emerald-400">{formatMoney(paidTotal, cur)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Pending</p>
          <p className="text-xl font-black text-amber-400">{formatMoney(pendingTotal, cur)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Entries</p>
          <p className="text-xl font-black text-white">{salaries.length}</p>
        </div>
      </div>

      <div className="glass-card p-5 mb-5 grid sm:grid-cols-5 gap-3">
        <select className={input} value={f.expertId} onChange={(e) => setF({ ...f, expertId: e.target.value })}>
          <option value="">Expert…</option>
          {experts.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
        </select>
        <input className={input} type="number" placeholder="Amount" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <select className={input} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Currency })}>
          {CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
        </select>
        <input className={input} type="month" value={f.period} onChange={(e) => setF({ ...f, period: e.target.value })} />
        <button onClick={add} disabled={busy === "add" || !f.expertId || !f.amount} className="btn-primary !py-2 text-sm">
          {busy === "add" ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-8"><Loader2 size={22} className="animate-spin text-aura-cyan" /></div>
      ) : salaries.length === 0 ? (
        <p className="text-sm text-gray-500">No salary entries yet.</p>
      ) : (
        <div className="space-y-2">
          {salaries.map((s) => (
            <div key={s.$id} className="glass-card p-4 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{s.expertName}</p>
                <p className="text-xs text-gray-500">{s.period}{s.note ? ` · ${s.note}` : ""}</p>
              </div>
              <span className="font-bold text-white shrink-0">{formatMoney(s.amount, s.currency)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${s.paid ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {s.paid ? "Paid" : "Pending"}
              </span>
              <button onClick={() => togglePaid(s)} disabled={!!busy} className="btn-secondary !p-2" title={s.paid ? "Mark pending" : "Mark paid"}>
                {busy === s.$id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button onClick={() => remove(s)} disabled={!!busy} className="btn-secondary !p-2" title="Delete"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
