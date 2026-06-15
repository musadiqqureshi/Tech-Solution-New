"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Briefcase, Users, UserCog, ArrowRight, Loader2 } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/OrderBits";
import { listAllOrders, formatMoney } from "@/lib/orders";
import { getHomepageExperts } from "@/lib/data";
import type { Order } from "@/lib/types";

const ACTIVE = ["approved", "in_progress"];

export default function AdminDashboard() {
  useRequireRole(["admin"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expertCount, setExpertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllOrders().catch(() => []), getHomepageExperts().catch(() => [])])
      .then(([o, e]) => {
        setOrders(o);
        setExpertCount(e.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenue = orders.filter((o) => o.paid).reduce((s, o) => s + (o.budget ?? 0), 0);
  const revenueCurrency = orders.find((o) => o.paid)?.currency;
  const active = orders.filter((o) => ACTIVE.includes(o.status)).length;
  const clients = new Set(orders.map((o) => o.clientId)).size;

  return (
    <>
      <PageHeader title="Admin Overview" subtitle="Operational control center" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatMoney(revenue, revenueCurrency)} color="purple" index={0} />
        <StatCard icon={TrendingUp} label="Paid Orders" value={String(orders.filter((o) => o.paid).length)} color="cyan" index={1} />
        <StatCard icon={Briefcase} label="Active Projects" value={String(active)} color="blue" index={2} />
        <StatCard icon={Users} label="Clients" value={String(clients)} color="gold" index={3} />
        <StatCard icon={UserCog} label="Experts" value={String(expertCount)} color="purple" index={4} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Orders</h2>
        <Link href="/app/admin/orders" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1">
          Manage all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 size={26} className="animate-spin text-aura-cyan" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-gray-400">
          No orders yet. They’ll appear here as clients submit them.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((o) => (
            <Link key={o.$id} href={`/app/admin/orders/${o.$id}`} className="glass-card glass-card-hover p-4 flex items-center gap-4 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="text-white text-sm font-semibold mt-1 truncate">{o.title}</h3>
                <p className="text-xs text-gray-500">{o.clientName}</p>
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
