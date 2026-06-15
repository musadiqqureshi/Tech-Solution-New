"use client";

import { useEffect, useState } from "react";
import { Loader2, ListTodo, Play, Send, Calendar, Wallet, Link2, Check } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge, TaskTimeline } from "@/components/app/TaskBits";
import { listExpertTasks, setMyTaskStatus, setMyTaskDelivery, expertNextStatus } from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import type { Task } from "@/lib/types";

export default function ExpertTasks() {
  useRequireRole(["expert", "admin"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState("");

  useEffect(() => {
    listExpertTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const saveDelivery = async (t: Task) => {
    if (!t.$id) return;
    const link = links[t.$id] ?? t.deliveryLink ?? "";
    setBusy(t.$id + "-d");
    setError("");
    try {
      await setMyTaskDelivery(t.$id, link);
      setTasks((prev) => prev.map((x) => (x.$id === t.$id ? { ...x, deliveryLink: link } : x)));
      setSavedId(t.$id);
      setTimeout(() => setSavedId(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save delivery link.");
    } finally {
      setBusy("");
    }
  };

  const act = async (t: Task) => {
    const next = expertNextStatus(t.status);
    if (!next || !t.$id) return;
    setBusy(t.$id);
    setError("");
    try {
      await setMyTaskStatus(t.$id, next);
      setTasks((prev) => prev.map((x) => (x.$id === t.$id ? { ...x, status: next } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Your assigned work — client details and profit are hidden" />

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

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
        <div className="space-y-4">
          {tasks.map((t) => {
            const next = expertNextStatus(t.status);
            return (
              <div key={t.$id} className="glass-card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <TaskBadge status={t.status} />
                    <h3 className="text-white font-bold mt-2">{t.title}</h3>
                  </div>
                  <div className="text-right shrink-0 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-300 justify-end">
                      <Wallet size={14} className="text-aura-gold" />
                      {formatMoney(t.expertBudget, t.currency)}
                    </div>
                    {t.deadline && (
                      <div className="flex items-center gap-1.5 text-gray-500 justify-end mt-1">
                        <Calendar size={14} /> {t.deadline}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-5">
                  {t.description}
                </p>

                <div className="mb-5">
                  <TaskTimeline status={t.status} />
                </div>

                {/* Final delivery link */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Link2 size={15} className="text-aura-cyan shrink-0" />
                  <input
                    placeholder="Final delivery link (Drive, GitHub, Figma…)"
                    defaultValue={t.deliveryLink ?? ""}
                    onChange={(e) => t.$id && setLinks((p) => ({ ...p, [t.$id!]: e.target.value }))}
                    className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
                  />
                  <button onClick={() => saveDelivery(t)} disabled={!!busy} className="btn-secondary !py-2 text-xs">
                    {busy === t.$id + "-d" ? <Loader2 size={14} className="animate-spin" /> : savedId === t.$id ? <Check size={14} /> : <Link2 size={14} />}
                    {savedId === t.$id ? "Saved" : "Save delivery"}
                  </button>
                </div>

                {next ? (
                  <button onClick={() => act(t)} disabled={!!busy} className="btn-primary !py-2 text-sm">
                    {busy === t.$id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : next === "in_progress" ? (
                      <Play size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    {next === "in_progress" ? "Start Working" : "Submit for Review"}
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">
                    {t.status === "submitted"
                      ? "Awaiting admin review."
                      : t.status === "approved"
                      ? "Approved — awaiting completion."
                      : "Completed."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
