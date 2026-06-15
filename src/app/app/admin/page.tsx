"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, DollarSign, Briefcase, Users, UserCog, ArrowRight, Loader2, Star, Trash2, Eye, EyeOff,
} from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";
import { StatusBadge } from "@/components/app/OrderBits";
import { listAllOrders, formatMoney } from "@/lib/orders";
import { listAllTasks, taskProfit } from "@/lib/tasks";
import { listAllReviews, setReviewApproved, deleteReview } from "@/lib/reviews";
import { getHomepageExperts } from "@/lib/data";
import type { Order, Task, Review } from "@/lib/types";

const ACTIVE = ["approved", "in_progress"];
const PIE_COLORS = ["#a78bfa", "#60a5fa", "#22d3ee", "#fbbf24", "#34d399", "#f87171"];

export default function AdminDashboard() {
  useRequireRole(["admin"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expertCount, setExpertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    Promise.all([
      listAllOrders().catch(() => []),
      listAllTasks().catch(() => []),
      listAllReviews().catch(() => []),
      getHomepageExperts().catch(() => []),
    ])
      .then(([o, t, r, e]) => {
        setOrders(o);
        setTasks(t);
        setReviews(r);
        setExpertCount(e.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.paid);
  const revenue = paidOrders.reduce((s, o) => s + (o.budget ?? 0), 0);
  const cur = paidOrders.find((o) => o.currency)?.currency;
  const active = orders.filter((o) => ACTIVE.includes(o.status)).length;
  const clients = new Set(orders.map((o) => o.clientId)).size;
  const profit = tasks
    .filter((t) => t.status === "completed" || t.status === "approved")
    .reduce((s, t) => s + (taskProfit(t) ?? 0), 0);

  // Monthly revenue (last 6 months) from paid orders.
  const monthly = monthlySeries(paidOrders);
  // Service breakdown by order count.
  const byService = Object.entries(
    orders.reduce<Record<string, number>>((m, o) => {
      m[o.service] = (m[o.service] ?? 0) + 1;
      return m;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const moderate = async (r: Review, approved: boolean) => {
    if (!r.$id) return;
    setBusy(r.$id);
    try {
      const u = await setReviewApproved(r.$id, approved);
      setReviews((prev) => prev.map((x) => (x.$id === u.$id ? u : x)));
    } finally {
      setBusy("");
    }
  };
  const removeReview = async (r: Review) => {
    if (!r.$id) return;
    setBusy(r.$id);
    try {
      await deleteReview(r.$id);
      setReviews((prev) => prev.filter((x) => x.$id !== r.$id));
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageHeader title="Admin Overview" subtitle="Revenue, profit, and operations at a glance" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatMoney(revenue, cur)} color="purple" index={0} />
        <StatCard icon={TrendingUp} label="Est. Profit" value={formatMoney(profit, cur)} color="cyan" index={1} />
        <StatCard icon={Briefcase} label="Active Projects" value={String(active)} color="blue" index={2} />
        <StatCard icon={Users} label="Clients" value={String(clients)} color="gold" index={3} />
        <StatCard icon={UserCog} label="Experts" value={String(expertCount)} color="purple" index={4} />
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 size={26} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5 mb-8">
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Monthly Revenue</h2>
              {monthly.every((m) => m.value === 0) ? (
                <p className="text-sm text-gray-500 py-12 text-center">No paid revenue yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={tooltip} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#a78bfa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Service Breakdown</h2>
              {byService.length === 0 ? (
                <p className="text-sm text-gray-500 py-12 text-center">No orders yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byService} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {byService.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Reviews moderation */}
          {reviews.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Reviews</h2>
              <div className="space-y-3">
                {reviews.slice(0, 6).map((r) => (
                  <div key={r.$id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                    <div className="flex gap-0.5 shrink-0 mt-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} className={n <= r.rating ? "text-aura-gold fill-aura-gold" : "text-gray-600"} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300">{r.comment || <span className="text-gray-500">No comment</span>}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.clientName}{r.approved ? " · featured" : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => moderate(r, !r.approved)} disabled={!!busy} title={r.approved ? "Unfeature" : "Feature on homepage"} className="btn-secondary !p-2">
                        {busy === r.$id ? <Loader2 size={13} className="animate-spin" /> : r.approved ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => removeReview(r)} disabled={!!busy} className="btn-secondary !p-2" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Orders</h2>
            <Link href="/app/admin/orders" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1">
              Manage all <ArrowRight size={14} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="glass-card p-8 text-center text-sm text-gray-400">No orders yet.</div>
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
      )}
    </>
  );
}

const tooltip = {
  background: "#14142a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
} as const;

/** Last 6 months revenue buckets from paid orders. */
function monthlySeries(paid: Order[]) {
  const now = new Date();
  const buckets: { name: string; key: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      name: d.toLocaleString(undefined, { month: "short" }),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      value: 0,
    });
  }
  for (const o of paid) {
    if (!o.$createdAt) continue;
    const d = new Date(o.$createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.value += o.budget ?? 0;
  }
  return buckets;
}
