"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, ArrowRight } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/OrderBits";
import { listAllOrders, formatMoney, STATUS_META } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";

const FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "approved",
  "in_progress",
  "delivered",
  "completed",
  "rejected",
];

export default function AdminOrders() {
  useRequireRole(["admin"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    listAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <PageHeader title="Orders Management" subtitle="All client orders across the platform" />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-aura-purple/20 border-aura-purple/50 text-white"
                  : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? "All" : STATUS_META[f].label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : shown.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ShoppingBag size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No orders in this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <Link
              key={o.$id}
              href={`/app/admin/orders/${o.$id}`}
              className="glass-card glass-card-hover p-5 flex items-center gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                  {o.paid && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      Paid
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold mt-1.5 truncate">{o.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {o.clientName} · {o.service}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white font-bold">{formatMoney(o.budget, o.currency)}</div>
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
