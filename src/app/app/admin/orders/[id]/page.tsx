"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Check, X, Play, Truck, BadgeCheck,
  DollarSign, Calendar, Tag, User, Mail, Link2, MessageCircle, ExternalLink,
} from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { StatusBadge, StatusTimeline } from "@/components/app/OrderBits";
import { getOrder, updateOrder, setOrderDelivery, nextStatus, formatMoney } from "@/lib/orders";
import { generatePhaseInvoice } from "@/lib/invoices";
import type { Order, OrderStatus } from "@/lib/types";

const ADVANCE_LABEL: Partial<Record<OrderStatus, { label: string; icon: typeof Play }>> = {
  approved: { label: "Approve", icon: Check },
  in_progress: { label: "Start Project", icon: Play },
  delivered: { label: "Mark Delivered", icon: Truck },
  completed: { label: "Mark Completed", icon: BadgeCheck },
};

export default function AdminOrderDetail() {
  useRequireRole(["admin"]);
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState("");

  useEffect(() => {
    if (!params.id) return;
    getOrder(params.id)
      .then((o) => {
        setOrder(o);
        setDelivery(o.deliveryLink ?? "");
      })
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const saveDelivery = async () => {
    if (!order?.$id) return;
    setBusy("delivery");
    setError("");
    try {
      setOrder(await setOrderDelivery(order.$id, delivery));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save delivery link.");
    } finally {
      setBusy("");
    }
  };

  const act = async (action: string, fields: Partial<Pick<Order, "status" | "paid">>) => {
    if (!order?.$id) return;
    setBusy(action);
    setError("");
    try {
      const updated = await updateOrder(order.$id, fields);
      setOrder(updated);
      // Auto-issue phased invoices: 30% on approval, 70% on delivery.
      if (fields.status === "approved") await generatePhaseInvoice(updated, "advance").catch(() => {});
      if (fields.status === "delivered") await generatePhaseInvoice(updated, "final").catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 size={28} className="animate-spin text-aura-cyan" />
      </div>
    );
  }
  if (error && !order) {
    return (
      <>
        <Back />
        <div className="glass-card p-10 text-center text-gray-400">{error}</div>
      </>
    );
  }
  if (!order) return null;

  const next = nextStatus(order.status);
  const advance = next ? ADVANCE_LABEL[next] : null;
  const created = order.$createdAt
    ? new Date(order.$createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

  return (
    <>
      <Back />
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <span className="font-mono text-sm text-aura-cyan">{order.orderNumber}</span>
        <StatusBadge status={order.status} />
      </div>
      <PageHeader title={order.title} />

      {/* Action bar */}
      <div className="glass-card p-5 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {order.status === "pending" && (
            <button onClick={() => act("reject", { status: "rejected" })} disabled={!!busy} className="btn-secondary !py-2 text-sm">
              {busy === "reject" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} Reject
            </button>
          )}
          {advance && next && order.status !== "rejected" && (
            <button onClick={() => act("advance", { status: next })} disabled={!!busy} className="btn-primary !py-2 text-sm">
              {busy === "advance" ? <Loader2 size={16} className="animate-spin" /> : <advance.icon size={16} />}
              {advance.label}
            </button>
          )}
          <button
            onClick={() => act("paid", { paid: !order.paid })}
            disabled={!!busy}
            className={order.paid ? "btn-secondary !py-2 text-sm" : "btn-gold !py-2 text-sm"}
          >
            {busy === "paid" ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
            {order.paid ? "Mark Unpaid" : "Mark Paid"}
          </button>
          {order.status === "rejected" && (
            <button onClick={() => act("reopen", { status: "pending" })} disabled={!!busy} className="btn-secondary !py-2 text-sm">
              {busy === "reopen" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Reopen
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      </div>

      {/* Progress */}
      <div className="glass-card p-6 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Progress</h3>
        <StatusTimeline status={order.status} />
      </div>

      {/* Final delivery (visible to the client) */}
      <div className="glass-card p-6 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Link2 size={14} /> Final Delivery
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            placeholder="Delivery link (Drive, GitHub, ZIP URL…) — shown to the client"
            className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
          />
          <button onClick={saveDelivery} disabled={!!busy} className="btn-primary !py-2 text-sm">
            {busy === "delivery" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save
          </button>
          {order.deliveryLink && (
            <a href={order.deliveryLink} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 text-sm">
              <ExternalLink size={15} /> Open
            </a>
          )}
        </div>
      </div>

      {/* Client follow-up request */}
      {order.followUp && (
        <div className="glass-card p-6 mb-5 border border-aura-gold/30">
          <h3 className="text-xs font-semibold text-aura-gold uppercase tracking-widest mb-3 flex items-center gap-2">
            <MessageCircle size={14} /> Client Follow-up Request
          </h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{order.followUp}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3">Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{order.description}</p>
          </div>
          {order.requirements && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3">Requirements</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{order.requirements}</p>
            </div>
          )}
          {order.requirementLink && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Link2 size={15} className="text-aura-cyan" /> Requirement Files
              </h3>
              <a href={order.requirementLink} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 text-sm">
                <ExternalLink size={15} /> Open client’s link
              </a>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="glass-card p-5 space-y-4">
            <Meta icon={User} label="Client" value={order.clientName} />
            <Meta icon={Mail} label="Email" value={order.clientEmail} />
            <Meta icon={Tag} label="Service" value={order.service} />
            <Meta icon={DollarSign} label="Budget" value={formatMoney(order.budget, order.currency)} />
            <Meta icon={Calendar} label="Created" value={created} />
            {order.deadline && <Meta icon={Calendar} label="Deadline" value={new Date(order.deadline).toLocaleDateString()} />}
          </div>
        </div>
      </div>
    </>
  );
}

function Back() {
  return (
    <Link href="/app/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
      <ArrowLeft size={16} /> Back to orders
    </Link>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-aura-purple mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-sm text-white break-words">{value}</p>
      </div>
    </div>
  );
}
