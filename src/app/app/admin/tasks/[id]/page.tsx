"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Check, BadgeCheck, Truck, RotateCcw, Send,
  Calendar, Wallet, User, ExternalLink, Link2, DollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { externalUrl } from "@/lib/url";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge, TaskTimeline } from "@/components/app/TaskBits";
import FeedbackThread from "@/components/app/FeedbackThread";
import Attachments from "@/components/app/Attachments";
import {
  getTask, updateTaskStatus, requestRevision, deliverToClient, setTaskDeliveryNotes,
  adminNextStatus, taskProfit,
} from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import { postFeedback } from "@/lib/feedback";
import type { Task } from "@/lib/types";

export default function AdminTaskDetail() {
  useRequireRole(["admin"]);
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [revText, setRevText] = useState("");
  const [revLink, setRevLink] = useState("");
  const [followText, setFollowText] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!params.id) return;
    getTask(params.id)
      .then((t) => {
        setTask(t);
        setNotes(t.deliveryNotes ?? "");
      })
      .catch(() => setError("Task not found."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const run = async (key: string, fn: () => Promise<Task | void>) => {
    setBusy(key);
    setError("");
    try {
      const r = await fn();
      if (r) setTask(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="grid place-items-center py-32"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>;
  if (!task) return (<><Back /><div className="glass-card p-10 text-center text-gray-400">{error || "Not found."}</div></>);

  const next = adminNextStatus(task.status);
  const profit = taskProfit(task);
  const submitted = task.$createdAt ? new Date(task.$createdAt).toLocaleString() : "—";

  return (
    <>
      <Back />
      <div className="flex items-center gap-2.5 flex-wrap mt-3 mb-1">
        {task.taskNumber && <span className="font-mono text-sm text-aura-cyan">{task.taskNumber}</span>}
        <TaskBadge status={task.status} />
        {(task.revisionCount ?? 0) > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">{task.revisionCount} revision(s)</span>
        )}
      </div>
      <PageHeader title={task.title} />

      {/* Actions */}
      <div className="glass-card p-5 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Review Actions</h3>
        <div className="flex flex-wrap gap-3">
          {task.status === "submitted" && (
            <button onClick={() => run("approve", () => updateTaskStatus(task.$id!, "approved"))} disabled={!!busy} className="btn-primary !py-2 text-sm">
              {busy === "approve" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Approve
            </button>
          )}
          {next && task.status !== "submitted" && (
            <button onClick={() => run("advance", () => next === "delivered" ? deliverToClient(task) : updateTaskStatus(task.$id!, next))} disabled={!!busy} className="btn-primary !py-2 text-sm">
              {busy === "advance" ? <Loader2 size={15} className="animate-spin" /> : next === "delivered" ? <Truck size={15} /> : <BadgeCheck size={15} />}
              {next === "delivered" ? "Deliver to Client" : next === "completed" ? "Mark Completed" : "Advance"}
            </button>
          )}
          {task.status === "approved" && (
            <button onClick={() => run("deliver", () => deliverToClient(task))} disabled={!!busy} className="btn-primary !py-2 text-sm">
              {busy === "deliver" ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />} Deliver to Client
            </button>
          )}
        </div>

        {/* Request revision */}
        {["submitted", "approved", "under_revision"].includes(task.status) && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Request Revision</label>
            <textarea value={revText} onChange={(e) => setRevText(e.target.value)} rows={2} placeholder="What needs to change? Be specific…" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50" />
            <input value={revLink} onChange={(e) => setRevLink(e.target.value)} placeholder="Revised reference / marked-up file link (optional)" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50" />
            <button
              onClick={() => revText.trim() && run("revision", async () => { const t = await requestRevision(task, revText.trim(), revLink.trim() || undefined); setRevText(""); setRevLink(""); return t; })}
              disabled={!!busy || !revText.trim()}
              className="btn-secondary !py-2 text-sm mt-2"
            >
              {busy === "revision" ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />} Send Revision Request
            </button>
            {task.status === "revision_requested" && task.revisionLink && (
              <a href={externalUrl(task.revisionLink)} target="_blank" rel="noopener noreferrer" className="text-xs text-aura-cyan hover:underline inline-flex items-center gap-1 mt-2">
                <ExternalLink size={13} /> Revised reference link sent to expert
              </a>
            )}
          </div>
        )}

        {/* Follow-up */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Request Follow-up</label>
          <textarea value={followText} onChange={(e) => setFollowText(e.target.value)} rows={2} placeholder="Ask for current progress, ETA, clarifications…" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50" />
          <button
            onClick={() => followText.trim() && user && run("follow", async () => { await postFeedback({ taskId: task.$id!, authorId: user.id, authorRole: "admin", body: followText.trim(), kind: "follow_up" }); setFollowText(""); })}
            disabled={!!busy || !followText.trim()}
            className="btn-secondary !py-2 text-sm mt-2"
          >
            {busy === "follow" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send Follow-up
          </button>
        </div>
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      </div>

      {/* Progress */}
      <div className="glass-card p-6 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Progress</h3>
        <TaskTimeline status={task.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          {/* Final delivery visibility */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Link2 size={16} className="text-aura-cyan" /> Final Delivery</h3>
            {task.deliveryLink ? (
              <a href={externalUrl(task.deliveryLink)} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 text-sm"><ExternalLink size={15} /> Open delivery</a>
            ) : (
              <p className="text-sm text-gray-500">No delivery link submitted yet.</p>
            )}
            <div className="mt-4">
              <label className="text-xs text-gray-400">Delivery notes (internal)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-aura-purple/50" />
              <button onClick={() => task.$id && run("notes", async () => { await setTaskDeliveryNotes(task.$id!, notes); })} disabled={!!busy} className="btn-secondary !py-1.5 text-xs mt-2">
                {busy === "notes" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save notes
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3">Description</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.description}</p>
          </div>
          {task.requirements && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3">Requirements</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.requirements}</p>
            </div>
          )}

          {task.$id && (
            <Attachments entityType="task" entityId={task.$id} kind="delivery" title="Delivery Files" canUpload emptyText="No delivery files uploaded yet." />
          )}

          {task.$id && user && <FeedbackThread taskId={task.$id} me={{ id: user.id, role: "admin" }} />}
        </div>

        <div className="space-y-3">
          <div className="glass-card p-5 space-y-4">
            <Meta icon={User} label="Expert" value={task.expertName ?? "—"} />
            <Meta icon={Wallet} label="Expert budget" value={formatMoney(task.expertBudget, task.currency)} />
            <Meta icon={DollarSign} label="Client budget" value={formatMoney(task.clientBudget, task.currency)} />
            {profit != null && <Meta icon={DollarSign} label="Profit" value={formatMoney(profit, task.currency)} />}
            {task.deadline && <Meta icon={Calendar} label="Deadline" value={task.deadline} />}
            <Meta icon={Calendar} label="Created" value={submitted} />
            {task.requirementLink && (
              <div className="flex items-start gap-3">
                <Link2 size={16} className="text-aura-purple mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500">Requirement files</p>
                  <a href={externalUrl(task.requirementLink)} target="_blank" rel="noopener noreferrer" className="text-sm text-aura-cyan hover:underline break-all">Open link</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Back() {
  return <Link href="/app/admin/tasks" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"><ArrowLeft size={16} /> Back to tasks</Link>;
}
function Meta({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-aura-purple mt-0.5 shrink-0" />
      <div className="min-w-0"><p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p><p className="text-sm text-white break-words">{value}</p></div>
    </div>
  );
}
