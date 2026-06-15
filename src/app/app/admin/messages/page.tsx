"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import ChatThread from "@/components/app/ChatThread";
import { listConversations, type Conversation } from "@/lib/chat";

export default function AdminMessages() {
  useRequireRole(["admin"]);
  const { user } = useAuth();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Conversation | null>(null);

  useEffect(() => {
    listConversations()
      .then(setConvos)
      .catch(() => setConvos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Messages" subtitle="Client and expert conversations" />

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : convos.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <MessageSquare size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No conversations yet. Messages from clients and experts appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          {/* Conversation list */}
          <div className={`space-y-2 ${active ? "hidden md:block" : ""}`}>
            {convos.map((c) => (
              <button
                key={c.peerId}
                onClick={() => setActive(c)}
                className={`w-full text-left glass-card glass-card-hover p-3 flex items-center gap-3 ${
                  active?.peerId === c.peerId ? "ring-1 ring-aura-purple/50" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30 grid place-items-center text-sm font-bold text-white shrink-0">
                  {(c.peerName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{c.peerName || "Unknown"}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastBody}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 text-[10px] font-bold bg-aura-purple text-white rounded-full px-2 py-0.5">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active thread */}
          <div className={active ? "" : "hidden md:block"}>
            {active && user ? (
              <>
                <button onClick={() => setActive(null)} className="md:hidden inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-3">
                  <ArrowLeft size={16} /> Conversations
                </button>
                <ChatThread
                  peerId={active.peerId}
                  peerName={active.peerName || "Client"}
                  me={{ id: user.id, name: user.name, isAdmin: true }}
                />
              </>
            ) : (
              <div className="glass-card h-full min-h-[420px] grid place-items-center text-sm text-gray-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
