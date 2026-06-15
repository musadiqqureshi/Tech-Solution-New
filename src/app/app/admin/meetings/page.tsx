"use client";

import { useEffect, useState } from "react";
import { Loader2, CalendarDays, Check, X, BadgeCheck } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { listAllMeetings, updateMeeting, MEETING_STATUS_META } from "@/lib/meetings";
import type { Meeting } from "@/lib/types";

function Badge({ status }: { status: Meeting["status"] }) {
  const m = MEETING_STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${m.color}22`, color: m.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export default function AdminMeetings() {
  useRequireRole(["admin"]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    listAllMeetings()
      .then(setMeetings)
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  const act = async (m: Meeting, status: Meeting["status"]) => {
    if (!m.$id) return;
    setBusy(m.$id);
    try {
      const updated = await updateMeeting(m.$id, {
        status,
        ...(status === "confirmed" ? { meetingLink: links[m.$id] ?? m.meetingLink } : {}),
      });
      setMeetings((prev) => prev.map((x) => (x.$id === updated.$id ? updated : x)));
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageHeader title="Meetings" subtitle="Confirm and schedule client consultations" />

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : meetings.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <CalendarDays size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No meeting requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.$id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <Badge status={m.status} />
                  <h3 className="text-white font-semibold mt-2">{m.topic}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {m.clientName} · {m.clientEmail}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(m.preferredAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {m.durationMin} min
                  </p>
                  {m.notes && <p className="text-sm text-gray-500 mt-2">{m.notes}</p>}
                </div>
              </div>

              {(m.status === "requested" || m.status === "confirmed") && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <input
                    placeholder="Meeting link (Google Meet / Zoom)"
                    defaultValue={m.meetingLink ?? ""}
                    onChange={(e) => setLinks((p) => ({ ...p, [m.$id!]: e.target.value }))}
                    className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
                  />
                  {m.status === "requested" && (
                    <>
                      <button onClick={() => act(m, "confirmed")} disabled={!!busy} className="btn-primary !py-2 text-sm">
                        {busy === m.$id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Confirm
                      </button>
                      <button onClick={() => act(m, "declined")} disabled={!!busy} className="btn-secondary !py-2 text-sm">
                        <X size={15} /> Decline
                      </button>
                    </>
                  )}
                  {m.status === "confirmed" && (
                    <button onClick={() => act(m, "completed")} disabled={!!busy} className="btn-secondary !py-2 text-sm">
                      <BadgeCheck size={15} /> Mark Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
