"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  listMyNotifications, markAllNotificationsRead, subscribeNotifications,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";

/** Short pleasant "ding" via the Web Audio API — no asset needed. */
function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    const resume = () => {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (Ctx) ctxRef.current = new Ctx();
      }
      ctxRef.current?.resume();
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);
  return () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  };
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const chime = useChime();

  useEffect(() => {
    if (!user?.id) return;
    listMyNotifications().then(setItems).catch(() => {});
    const unsub = subscribeNotifications(user.id, (n) => {
      setItems((prev) => [n, ...prev]);
      chime();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unread = items.filter((n) => !n.read).length;

  const openMenu = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await markAllNotificationsRead().catch(() => {});
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const go = (n: AppNotification) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={openMenu}
        className="relative w-10 h-10 rounded-full glass-card grid place-items-center text-gray-300 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-aura-purple text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto glass-card p-2 shadow-2xl">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Notifications</span>
            <Check size={14} className="text-gray-500" />
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No notifications yet.</p>
          ) : (
            items.map((n) => (
              <button
                key={n.$id}
                onClick={() => go(n)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <p className="text-sm text-white font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-gray-400 truncate">{n.body}</p>}
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
