"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, ShoppingBag, PackageCheck, CalendarDays, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/OrderBits";
import { listClientOrders, formatMoney } from "@/lib/orders";
import type { Order } from "@/lib/types";

const ACTIVE = ["pending", "approved", "in_progress"];

export default function ClientDashboard() {
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

  const spend = orders
    .filter((o) => o.paid)
    .reduce((sum, o) => sum + (o.budget ?? 0), 0);
  const spendCurrency = orders.find((o) => o.paid)?.currency;
  const active = orders.filter((o) => ACTIVE.includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === "delivered" || o.status === "completed").length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle="Your projects at a glance"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Wallet} label="Total Spend" value={formatMoney(spend, spendCurrency)} color="purple" index={0} />
        <StatCard icon={ShoppingBag} label="Active Orders" value={String(active)} color="blue" index={1} />
        <StatCard icon={PackageCheck} label="Delivered" value={String(delivered)} color="cyan" index={2} />
        <StatCard icon={CalendarDays} label="Meetings" value="0" color="gold" index={3} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Orders</h2>
        <Link href="/app/client/orders" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 size={26} className="animate-spin text-aura-cyan" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">No orders yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Start your first project and track its progress, deliverables, and
            invoices right here.
          </p>
          <Link href="/app/client/orders/new" className="btn-primary">
            <Plus size={18} /> Create Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 4).map((o) => (
            <Link key={o.$id} href={`/app/client/orders/${o.$id}`} className="glass-card glass-card-hover p-4 flex items-center gap-4 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="text-white text-sm font-semibold mt-1 truncate">{o.title}</h3>
              </div>
              <span className="text-white font-bold text-sm shrink-0">{formatMoney(o.budget, o.currency)}</span>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
