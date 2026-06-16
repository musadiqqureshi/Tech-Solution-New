"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Play, Send, RotateCcw, Calendar, Wallet, Link2, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { TaskBadge, TaskTimeline } from "@/components/app/TaskBits";
import FeedbackThread from "@/components/app/FeedbackThread";
import Attachments from "@/components/app/Attachments";
import { getExpertTask, setMyTaskStatus, setMyTaskDelivery, expertNextStatus } from "@/lib/tasks";
import { formatMoney } from "@/lib/orders";
import { externalUrl } from "@/lib/url";
import type { Task } from "@/lib/types";

const ACTION: Record<string, { label: string; icon: typeof Play }> = {
  in_progress: { label: "Start Working", icon: Play },
  under_revision: { label: "Start Revision", icon: RotateCcw },
  submitted: { label: "Submit for Review", icon: Send },
};

export default function ExpertTaskDetail() {
  useRequireRole(["expert", "admin"]);
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [t, setT] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getExpertTask(params.id)
      .then((task) => {
        setT(task);
        setLink(task.deliveryLink ?? "");
      })
      .catch(() => setError("Task not found."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const saveDelivery = async () => {
    if (!t?.$id) return;
    setBusy("d");
    setError("");
    try {
      await setMyTaskDelivery(t.$id, link);
      setT({ ...t, deliveryLink: link });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save delivery link.");
    } finally {
      setBusy("");
    }
  };

  const advance = async () => {
    const next = t && expertNextStatus(t.status);
    if (!next || !t?.$id) return;
    setBusy("a");
    setError("");
    try {
      await setMyTaskStatus(t.$id, next);
      setT({ ...t, status: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="grid place-items-center py-32"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>;
  if (!t) return (<><Back /><div className="glass-card p-10 text-center text-gray-400">{error || "Not found."}</div></>);

  const next = expertNextStatus(t.status);

  return (
    <>
      <Back />
      <div className="flex items-center gap-2.5 flex-wrap mt-3 mb-1">
        {t.taskNumber && <span className="font-mono text-sm text-aura-cyan">{t.taskNumber}</span>}
        <TaskBadge status={t.status} />
      </div>
      <PageHeader title={t.title} />

      {(t.status === "revision_requested" || t.status === "under_revision") && (
        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-300 flex items-center gap-2">
            <RotateCcw size={15} /> Revision needed{(t.revisionCount ?? 0) > 0 ? ` (round ${t.revisionCount})` : ""}
          </p>
          <p className="text-xs text-gray-300 mt-1">See the feedback below, update your delivery link/files, and resubmit.</p>
          {t.revisionLink && (
            <a href={externalUrl(t.revisionLink)} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 text-xs mt-3">
              <ExternalLink size={14} /> Open revised reference
            </a>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="glass-card p-6"><TaskTimeline status={t.status} /></div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-2">Description</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{t.description}</p>
          </div>
          {t.requirements && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-2">Requirements</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{t.requirements}</p>
            </div>
          )}
          {t.requirementLink && (
            <a href={externalUrl(t.requirementLink)} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 text-sm">
              <ExternalLink size={15} /> Open requirement files
            </a>
          )}

          {/* Final delivery link */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Link2 size={16} className="text-aura-cyan" /> Final Delivery Link</h3>
            <div className="flex flex-wrap items-center gap-2">
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Drive, GitHub, Figma…" className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50" />
              <button onClick={saveDelivery} disabled={!!busy} className="btn-secondary !py-2 text-sm">
                {busy === "d" ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Link2 size={14} />} {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {t.$id && (
            <Attachments entityType="task" entityId={t.$id} kind="delivery" title="Delivery Files" canUpload emptyText="Upload your delivery files here." />
          )}

          {t.$id && user && <FeedbackThread taskId={t.$id} me={{ id: user.id, role: "expert" }} />}
        </div>

        <div className="space-y-3">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-gray-300"><Wallet size={15} className="text-aura-gold" /> {formatMoney(t.expertBudget, t.currency)}{t.salaried ? " (salaried)" : ""}</div>
            {t.deadline && <div className="flex items-center gap-2 text-gray-400 text-sm"><Calendar size={15} /> Due {t.deadline}</div>}
          </div>
          {next ? (
            <button onClick={advance} disabled={!!busy} className="btn-primary w-full justify-center">
              {busy === "a" ? <Loader2 size={16} className="animate-spin" /> : (() => { const A = ACTION[next].icon; return <A size={16} />; })()}
              {ACTION[next].label}
            </button>
          ) : (
            <p className="text-xs text-gray-500 glass-card p-4 text-center">
              {t.status === "submitted" ? "Submitted — awaiting admin review."
                : t.status === "approved" ? "Approved — awaiting delivery."
                : t.status === "delivered" ? "Delivered to the client."
                : "Completed."}
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </>
  );
}

function Back() {
  return <Link href="/app/expert/tasks" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"><ArrowLeft size={16} /> Back to tasks</Link>;
}
