"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/OrderBits";
import { listClientOrders, formatMoney } from "@/lib/orders";
import type { Order } from "@/lib/types";

export default function ClientOrders() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listClientOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8">
        <PageHeader title="Orders" subtitle="Create and track your projects" />
        <Link href="/app/client/orders/new" className="btn-primary !py-2.5 shrink-0">
          <Plus size={18} /> New Order
        </Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4 bg-gradient-to-br from-aura-purple/30 to-aura-cyan/20">
            <ShoppingBag size={26} className="text-aura-cyan" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">No orders yet</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Create your first order to brief us on your project. You’ll track its
            status and download deliverables right here.
          </p>
          <Link href="/app/client/orders/new" className="btn-primary">
            <Plus size={18} /> Create Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.$id}
              href={`/app/client/orders/${o.$id}`}
              className="glass-card glass-card-hover p-5 flex items-center gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="text-white font-semibold mt-1.5 truncate">{o.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{o.service}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white font-bold">{formatMoney(o.budget, o.currency)}</div>
                <div className="text-xs text-gray-500">{o.paid ? "Paid" : "Unpaid"}</div>
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
