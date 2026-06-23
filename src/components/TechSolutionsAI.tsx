"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Loader2, Sparkles } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm Tech Solutions AI 🤖 — ask me about our services, pricing, the SaaS platform, internships, or how to start a project.",
};

export default function TechSolutionsAI({ align = "right" }: { align?: "left" | "right" }) {
  const side = align === "left" ? "left-6" : "right-6";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    const next = [...messages, { role: "user" as const, content: body }];
    setMessages(next);
    setText("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: data.reply || data.error || "Sorry, I couldn't respond just now." }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 ${side} z-40 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white font-semibold shadow-2xl`}
          style={{ background: "linear-gradient(120deg,#7c3aed,#2563eb 60%,#06b6d4)" }}
          aria-label="Open Tech Solutions AI"
        >
          <Bot size={20} /> <span className="hidden sm:inline text-sm">Tech Solutions AI</span>
        </button>
      )}

      {open && (
        <div className={`fixed bottom-6 ${side} z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl border border-white/15 shadow-2xl overflow-hidden`} style={{ background: "#0e0e22" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10" style={{ background: "linear-gradient(120deg,rgba(124,58,237,0.25),rgba(6,182,212,0.18))" }}>
            <div className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-aura-purple to-aura-cyan"><Sparkles size={16} className="text-white" /></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white leading-none">Tech Solutions AI</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">online</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words" style={{ background: m.role === "user" ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)", color: "#f3f4f6" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="rounded-2xl px-3.5 py-2 bg-white/5"><Loader2 size={16} className="animate-spin text-aura-cyan" /></div></div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-white/10">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Tech Solutions AI…" className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-aura-purple/50" />
            <button type="submit" disabled={sending || !text.trim()} className="btn-primary !rounded-full !p-2.5 disabled:opacity-50">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
