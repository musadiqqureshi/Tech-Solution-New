"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Check, CheckCheck, Loader2 } from "lucide-react";
import {
  listMessages, sendMessage, markRead, subscribeMessages, joinPresence,
} from "@/lib/chat";
import type { ChatMessage } from "@/lib/types";

export default function ChatThread({
  peerId,
  peerName,
  me,
}: {
  peerId: string;
  peerName: string;
  me: { id: string; name: string; isAdmin: boolean };
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceRef = useRef<ReturnType<typeof joinPresence> | null>(null);

  const upsert = useCallback((m: ChatMessage) => {
    setMessages((prev) => {
      const i = prev.findIndex((x) => x.$id === m.$id);
      if (i === -1) return [...prev, m];
      const next = [...prev];
      next[i] = m;
      return next;
    });
  }, []);

  // Initial load + mark the other side's messages read.
  useEffect(() => {
    let active = true;
    setLoading(true);
    listMessages(peerId)
      .then((msgs) => {
        if (!active) return;
        setMessages(msgs);
        markRead(peerId, me.isAdmin).catch(() => {});
      })
      .catch(() => setMessages([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [peerId, me.isAdmin]);

  // Realtime messages + read receipts.
  useEffect(() => {
    const unsub = subscribeMessages(peerId, (m) => {
      upsert(m);
      // If a message from the other side arrives while we're viewing, mark read.
      if (m.fromAdmin !== me.isAdmin && !m.read) markRead(peerId, me.isAdmin).catch(() => {});
    });
    return unsub;
  }, [peerId, me.isAdmin, upsert]);

  // Presence + typing.
  useEffect(() => {
    const handle = joinPresence(peerId, { id: me.id, isAdmin: me.isAdmin }, (o, t) => {
      setOnline(o);
      setTyping(t);
    });
    presenceRef.current = handle;
    return () => handle.cleanup();
  }, [peerId, me.id, me.isAdmin]);

  // Auto-scroll on new messages / typing.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const onType = (v: string) => {
    setText(v);
    presenceRef.current?.setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => presenceRef.current?.setTyping(false), 1500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    presenceRef.current?.setTyping(false);
    try {
      const msg = await sendMessage({ peerId, body, fromAdmin: me.isAdmin, senderName: me.name });
      upsert(msg);
    } catch {
      setText(body); // restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[calc(100vh-220px)] min-h-[420px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30 grid place-items-center text-sm font-bold text-white">
          {peerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{peerName}</p>
          <p className="text-[11px]" style={{ color: online ? "#34d399" : "#6b7280" }}>
            {typing ? "typing…" : online ? "online" : "offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {loading ? (
          <div className="grid place-items-center h-full">
            <Loader2 size={24} className="animate-spin text-aura-cyan" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-10">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.fromAdmin === me.isAdmin;
            return (
              <div key={m.$id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-2xl px-3.5 py-2 text-sm"
                  style={{
                    background: mine ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)",
                    color: "#f3f4f6",
                  }}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <div className="flex items-center gap-1 justify-end mt-1 text-[10px] text-gray-400">
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    {mine && (m.read ? <CheckCheck size={12} className="text-aura-cyan" /> : <Check size={12} />)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2 text-sm bg-white/5 text-gray-400">…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t border-white/5">
        <input
          value={text}
          onChange={(e) => onType(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary !rounded-full !p-2.5 disabled:opacity-50">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
