"use client";

import {
  createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listMyNotifications, subscribeNotifications, markAllNotificationsRead,
  markNotificationsReadByType,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";

interface Ctx {
  notifications: AppNotification[];
  totalUnread: number;
  unreadByType: Record<string, number>;
  markAllRead: () => Promise<void>;
  markTypeRead: (type: string) => Promise<void>;
}

const NotificationsContext = createContext<Ctx | null>(null);

function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    const resume = () => {
      if (!ctxRef.current) {
        const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (C) ctxRef.current = new C();
      }
      ctxRef.current?.resume();
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);
  return useCallback(() => {
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
  }, []);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const chime = useChime();

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    listMyNotifications().then(setNotifications).catch(() => {});
    const unsub = subscribeNotifications(user.id, (n) => {
      setNotifications((prev) => (prev.some((x) => x.$id === n.$id) ? prev : [n, ...prev]));
      chime();
    });
    return unsub;
  }, [user?.id, chime]);

  const unreadByType = notifications.reduce<Record<string, number>>((m, n) => {
    if (!n.read) m[n.type] = (m[n.type] ?? 0) + 1;
    return m;
  }, {});
  const totalUnread = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead().catch(() => {});
  }, []);

  const markTypeRead = useCallback(async (type: string) => {
    setNotifications((prev) => prev.map((n) => (n.type === type ? { ...n, read: true } : n)));
    await markNotificationsReadByType(type).catch(() => {});
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, totalUnread, unreadByType, markAllRead, markTypeRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
