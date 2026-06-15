"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Tag, FileText, Download } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { StatusBadge, StatusTimeline } from "@/components/app/OrderBits";
import { getOrder, formatMoney } from "@/lib/orders";
import type { Order } from "@/lib/types";

export default function OrderDetail() {
  useRequireRole(["client", "admin"]);
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    getOrder(params.id)
      .then(setOrder)
      .catch(() => setError("Order not found or you don’t have access."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 size={28} className="animate-spin text-aura-cyan" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <Link href="/app/client/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <div className="glass-card p-10 text-center text-gray-400">{error || "Not found."}</div>
      </>
    );
  }

  const created = order.$createdAt
    ? new Date(order.$createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

  return (
    <>
      <Link href="/app/client/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <span className="font-mono text-sm text-aura-cyan">{order.orderNumber}</span>
        <StatusBadge status={order.status} />
        <span className={`text-xs px-2 py-0.5 rounded-full ${order.paid ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-gray-400"}`}>
          {order.paid ? "Paid" : "Unpaid"}
        </span>
      </div>
      <PageHeader title={order.title} />

      {/* Progress */}
      <div className="glass-card p-6 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Progress</h3>
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Details */}
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
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Download size={16} className="text-aura-cyan" /> Deliverables
            </h3>
            {order.deliverableFileIds?.length ? (
              <ul className="text-sm text-gray-300 space-y-2">
                {order.deliverableFileIds.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-500" /> {id}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No deliverables yet — they’ll appear here once your project is delivered.
              </p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-3">
          <div className="glass-card p-5 space-y-4">
            <Meta icon={Tag} label="Service" value={order.service} />
            <Meta icon={Calendar} label="Created" value={created} />
            <Meta icon={FileText} label="Budget" value={formatMoney(order.budget, order.currency)} />
          </div>
        </div>
      </div>
    </>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-aura-purple mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
