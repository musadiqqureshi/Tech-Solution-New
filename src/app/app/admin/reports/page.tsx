"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Download } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { listAllOrders, formatMoney } from "@/lib/orders";
import { listAllTasks, taskProfit } from "@/lib/tasks";
import type { Order, Task, Currency } from "@/lib/types";

function monthKey(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminReports() {
  useRequireRole(["admin"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  useEffect(() => {
    Promise.all([listAllOrders().catch(() => []), listAllTasks().catch(() => [])])
      .then(([o, t]) => {
        setOrders(o);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, []);

  // Month options from the last 12 months.
  const months = useMemo(() => {
    const out: { key: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString(undefined, { month: "long", year: "numeric" }),
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthOrders = orders.filter((o) => monthKey(o.$createdAt) === month);
  const monthTasks = tasks.filter((t) => monthKey(t.$createdAt) === month);
  const cur: Currency | undefined = monthOrders.find((o) => o.currency)?.currency;

  const paid = monthOrders.filter((o) => o.paid);
  const revenue = paid.reduce((s, o) => s + (o.budget ?? 0), 0);
  const unpaidAmt = monthOrders.filter((o) => !o.paid).reduce((s, o) => s + (o.budget ?? 0), 0);
  const costs = monthTasks.reduce((s, t) => s + (t.expertBudget ?? 0), 0);
  const profit = monthTasks.reduce((s, t) => s + (taskProfit(t) ?? 0), 0);

  const services = Object.entries(
    monthOrders.reduce<Record<string, { count: number; revenue: number }>>((m, o) => {
      const k = o.service;
      m[k] = m[k] || { count: 0, revenue: 0 };
      m[k].count += 1;
      m[k].revenue += o.paid ? o.budget ?? 0 : 0;
      return m;
    }, {})
  );

  const label = months.find((m) => m.key === month)?.label ?? month;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <PageHeader title="Business Reports" subtitle="Monthly performance summary" />
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-aura-purple/50"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <button onClick={() => window.print()} className="btn-primary !py-2 text-sm">
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <div className="report-doc glass-card bg-white text-gray-900 rounded-2xl p-8 sm:p-10 max-w-3xl">
          <div className="flex items-start justify-between border-b border-gray-200 pb-5">
            <div>
              <div className="text-xl font-black">
                <span style={{ color: "#7c3aed" }}>Tech</span> <span style={{ color: "#06b6d4" }}>Solutions</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Monthly Business Report</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{label}</p>
              <p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
            <Metric label="Revenue" value={formatMoney(revenue, cur)} />
            <Metric label="Costs" value={formatMoney(costs, cur)} />
            <Metric label="Profit" value={formatMoney(profit, cur)} accent />
            <Metric label="Orders" value={String(monthOrders.length)} />
          </div>

          <Section title="Payment Status">
            <Row k="Collected (paid)" v={formatMoney(revenue, cur)} />
            <Row k="Outstanding (unpaid)" v={formatMoney(unpaidAmt, cur)} />
            <Row k="Paid orders" v={`${paid.length} of ${monthOrders.length}`} />
          </Section>

          <Section title="Services">
            {services.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No orders this month.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-200">
                    <th className="py-2">Service</th>
                    <th className="py-2 text-center">Orders</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(([name, v]) => (
                    <tr key={name} className="border-b border-gray-100">
                      <td className="py-2">{name}</td>
                      <td className="py-2 text-center">{v.count}</td>
                      <td className="py-2 text-right">{formatMoney(v.revenue, cur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
            Tech Solutions Pakistan · tech-solutions.site · This report reflects orders and tasks created in {label}.
          </p>
        </div>
      )}
    </>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-xl font-black ${accent ? "text-emerald-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-t border-gray-200">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
