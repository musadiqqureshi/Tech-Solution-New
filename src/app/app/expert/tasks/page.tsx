"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ListTodo, Calendar, Wallet, ArrowRight } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge } from "@/components/app/TaskBits";
import { listExpertTasks } from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import type { Task } from "@/lib/types";

export default function ExpertTasks() {
  useRequireRole(["expert", "admin", "intern"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExpertTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Open a task to see its full details" />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-aura-cyan" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ListTodo size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No tasks assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link
              key={t.$id}
              href={`/app/expert/tasks/${t.$id}`}
              className="glass-card glass-card-hover p-5 flex items-center gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {t.taskNumber && <span className="font-mono text-xs text-aura-cyan">{t.taskNumber}</span>}
                  <TaskBadge status={t.status} />
                  {(t.revisionCount ?? 0) > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">{t.revisionCount} rev</span>
                  )}
                </div>
                <h3 className="text-white font-semibold mt-1.5 truncate">{t.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><Wallet size={12} /> {formatMoney(t.expertBudget, t.currency)}{t.salaried ? " (salaried)" : ""}</span>
                  {t.deadline && <span className="inline-flex items-center gap-1"><Calendar size={12} /> {t.deadline}</span>}
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
