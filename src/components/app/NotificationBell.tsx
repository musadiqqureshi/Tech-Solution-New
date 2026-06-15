"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import type { AppNotification } from "@/lib/types";

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, totalUnread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const openMenu = async () => {
    const next = !open;
    setOpen(next);
    if (next && totalUnread > 0) await markAllRead();
  };

  const go = (n: AppNotification) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    // Sits left of the mobile hamburger; top-right on desktop.
    <div className="fixed top-2.5 right-16 lg:top-4 lg:right-4 z-50">
      <button
        onClick={openMenu}
        className="relative w-10 h-10 rounded-full glass-card grid place-items-center text-gray-300 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-aura-purple text-white text-[10px] font-bold grid place-items-center">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/15 p-2 shadow-2xl"
            style={{ background: "#14142a" }}
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Notifications
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.$id}
                  onClick={() => go(n)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors ${n.read ? "" : "bg-white/[0.03]"}`}
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
        </>
      )}
    </div>
  );
}
