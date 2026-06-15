"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Wallet, FileText, Check, Ban, Zap, X, ArrowRight } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { InvoiceBadge } from "@/components/app/InvoiceDocument";
import {
  listAllInvoices, createInvoice, generateFromOrder, updateInvoiceStatus,
} from "@/lib/invoices";
import { listAllOrders, CURRENCIES, formatMoney } from "@/lib/orders";
import type { Invoice, Order, Currency } from "@/lib/types";

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
