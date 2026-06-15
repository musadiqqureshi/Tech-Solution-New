"use client";

import { useEffect, useState } from "react";
import { Loader2, CalendarDays, Plus, X, CalendarPlus, Video } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import {
  listClientMeetings, requestMeeting, googleCalendarUrl, MEETING_STATUS_META,
} from "@/lib/meetings";
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

export default function ClientMeetings() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (!user?.id) return Promise.resolve();
    return listClientMeetings(user.id).then(setMeetings).catch(() => setMeetings([]));
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Meetings" subtitle="Request and schedule consultations" />
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary !py-2 text-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Close" : "Request Meeting"}
        </button>
      </div>

      {showForm && user && (
        <RequestForm
          onDone={async () => {
            setShowForm(false);
            await load();
          }}
          user={user}
        />
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : meetings.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <CalendarDays size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No meetings yet. Request a consultation above.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {meetings.map((m) => (
            <div key={m.$id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge status={m.status} />
                  <h3 className="text-white font-semibold mt-2">{m.topic}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(m.preferredAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    {" · "}{m.durationMin} min
                  </p>
                  {m.notes && <p className="text-sm text-gray-500 mt-2">{m.notes}</p>}
                </div>
                {m.status === "confirmed" && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <a href={googleCalendarUrl(m)} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 text-xs whitespace-nowrap">
                      <CalendarPlus size={14} /> Add to Calendar
                    </a>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary !py-1.5 text-xs whitespace-nowrap">
                        <Video size={14} /> Join
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function RequestForm({
  onDone,
  user,
}: {
  onDone: () => void;
  user: { id: string; name: string; email: string };
}) {
  const [f, setF] = useState({ topic: "", notes: "", date: "", time: "", duration: "30" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.topic || !f.date || !f.time) return setError("Topic, date and time are required.");
    setSaving(true);
    try {
      await requestMeeting({
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email,
        topic: f.topic,
        notes: f.notes || undefined,
        preferredAt: new Date(`${f.date}T${f.time}`).toISOString(),
        durationMin: Number(f.duration),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request meeting.");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

  return (
    <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
      <input className={input} placeholder="Meeting topic" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} />
      <textarea className={input} rows={2} placeholder="Notes (optional)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <div className="grid sm:grid-cols-3 gap-4">
        <input className={input} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <input className={input} type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
        <select className={input} value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })}>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary !py-2 text-sm">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />} Request Meeting
      </button>
    </form>
  );
}
