"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListTodo, Clock, CheckCircle2, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";
import { TaskBadge } from "@/components/app/TaskBits";
import { listExpertTasks } from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import type { Task } from "@/lib/types";

export default function ExpertDashboard() {
  useRequireRole(["expert", "admin"]);
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExpertTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const assigned = tasks.filter((t) => t.status === "assigned").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const earnings = tasks
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + (t.expertBudget ?? 0), 0);
  const currency = tasks.find((t) => t.currency)?.currency;

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle="Your assigned work and earnings"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ListTodo} label="Assigned" value={String(assigned)} color="purple" index={0} />
        <StatCard icon={Clock} label="In Progress" value={String(inProgress)} color="blue" index={1} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completed)} color="cyan" index={2} />
        <StatCard icon={Wallet} label="Earnings" value={formatMoney(earnings, currency)} color="gold" index={3} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Active Tasks</h2>
        <Link href="/app/expert/tasks" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 size={26} className="animate-spin text-aura-cyan" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <h2 className="text-lg font-bold text-white mb-2">No tasks assigned</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            When an admin assigns you a task, it appears here with its deadline
            and your budget. Client details and project profit stay hidden.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((t) => (
            <Link key={t.$id} href="/app/expert/tasks" className="glass-card glass-card-hover p-4 flex items-center gap-4 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <TaskBadge status={t.status} />
                  {t.deadline && <span className="text-[11px] text-gray-500">Due {t.deadline}</span>}
                </div>
                <h3 className="text-white text-sm font-semibold mt-1 truncate">{t.title}</h3>
              </div>
              <span className="text-white font-bold text-sm shrink-0">{formatMoney(t.expertBudget, t.currency)}</span>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
