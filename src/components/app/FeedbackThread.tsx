"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { listFeedback, postFeedback, subscribeFeedback } from "@/lib/feedback";
import type { TaskFeedback } from "@/lib/types";

const KIND_LABEL: Record<TaskFeedback["kind"], string> = {
  message: "Note",
  revision: "Revision",
  follow_up: "Follow-up",
  response: "Reply",
};

export default function FeedbackThread({
  taskId,
  me,
}: {
  taskId: string;
  me: { id: string; role: "admin" | "expert" };
}) {
  const [items, setItems] = useState<TaskFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const upsert = useCallback((f: TaskFeedback) => {
    setItems((prev) => (prev.some((x) => x.$id === f.$id) ? prev : [...prev, f]));
  }, []);

  useEffect(() => {
    listFeedback(taskId).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
    return subscribeFeedback(taskId, upsert);
  }, [taskId, upsert]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      const f = await postFeedback({ taskId, authorId: me.id, authorRole: me.role, body });
      upsert(f);
    } catch {
      setText(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-aura-cyan" /> Feedback & Communication
      </h3>

      {loading ? (
        <div className="grid place-items-center py-8"><Loader2 size={22} className="animate-spin text-aura-cyan" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No messages yet. Start the conversation below.</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {items.map((f) => {
            const mine = f.authorRole === me.role;
            return (
              <div key={f.$id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-3.5 py-2"
                  style={{ background: mine ? "rgba(124,58,237,0.30)" : "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: f.kind === "revision" ? "#f87171" : f.kind === "follow_up" ? "#fbbf24" : "#9ca3af" }}>
                      {f.authorRole} · {KIND_LABEL[f.kind]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-100 whitespace-pre-wrap break-words">{f.body}</p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(f.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={me.role === "admin" ? "Write feedback to the expert…" : "Reply to the admin…"}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary !rounded-full !p-2.5 disabled:opacity-50">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
