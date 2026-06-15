"use client";

import { useRef, useState } from "react";
import { Loader2, Sparkles, Send } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Draft a proposal for an e-commerce web app",
  "Qualify this lead: small clinic wants a booking system",
  "Estimate a budget for an AI chatbot project",
  "Summarize next steps for a delivered project",
];

export default function AuraAssistant() {
  useRequireRole(["admin"]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async (content: string) => {
    if (!content.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setText("");
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await fetch("/api/aura", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 503) {
        setNotConfigured(true);
        setMessages((m) => [...m, { role: "assistant", content: "Aura isn’t configured yet — add a GEMINI_API_KEY on the server to enable me." }]);
        return;
      }
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.text ?? "Something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <>
      <PageHeader title="Aura AI Assistant" subtitle="Sales, proposals, and operations — powered by Gemini" />

      {notConfigured && (
        <div className="glass-card p-4 mb-4 border border-amber-500/30 bg-amber-500/5 text-sm text-amber-300">
          Set <code>GEMINI_API_KEY</code> in your environment (server-side) to activate Aura.
        </div>
      )}

      <div className="glass-card flex flex-col h-[calc(100vh-240px)] min-h-[440px]">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full grid place-items-center text-center px-6">
              <div>
                <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4 bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30">
                  <Sparkles size={26} className="text-aura-cyan" />
                </div>
                <p className="text-sm text-gray-400 mb-4">Ask Aura to help with leads, proposals, estimates, or summaries.</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-aura-purple/50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                  style={{
                    background: m.role === "user" ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)",
                    color: "#f3f4f6",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 bg-white/5 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-center gap-2 px-4 py-3 border-t border-white/5"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask Aura…"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
          />
          <button type="submit" disabled={loading || !text.trim()} className="btn-primary !rounded-full !p-2.5 disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
