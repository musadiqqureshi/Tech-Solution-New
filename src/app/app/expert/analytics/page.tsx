"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Loader2, Wallet, CheckCircle2, Clock } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";
import { listExpertTasks, TASK_STATUS_META, TASK_FLOW } from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import type { Task, TaskStatus } from "@/lib/types";

export default function ExpertAnalytics() {
  useRequireRole(["expert", "admin"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExpertTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = tasks.filter((t) => t.status === "completed");
  const active = tasks.filter((t) => t.status === "assigned" || t.status === "in_progress");
  const earnings = completed.reduce((s, t) => s + (t.expertBudget ?? 0), 0);
  const currency = tasks.find((t) => t.currency)?.currency;

  const byStatus = TASK_FLOW.map((s) => ({
    name: TASK_STATUS_META[s].label,
    value: tasks.filter((t) => t.status === s).length,
    color: TASK_STATUS_META[s].color,
    key: s as TaskStatus,
  }));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Your performance at a glance" />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Wallet} label="Total Earnings" value={formatMoney(earnings, currency)} color="gold" index={0} />
            <StatCard icon={CheckCircle2} label="Completed Projects" value={String(completed.length)} color="cyan" index={1} />
            <StatCard icon={Clock} label="Active Projects" value={String(active.length)} color="purple" index={2} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Tasks by stage
            </h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">
                No task data yet. Charts populate as you receive and complete work.
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byStatus}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#14142a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {byStatus.map((d) => (
                        <Cell key={d.key} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
