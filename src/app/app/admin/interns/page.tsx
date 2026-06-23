"use client";

import { useEffect, useState } from "react";
import { Loader2, GraduationCap, Mail, Phone, Check, X, Eye } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { listApplications, setApplicationStatus, type InternshipApplication } from "@/lib/internships";

const STATUS: Record<string, string> = { new: "#fbbf24", reviewing: "#a78bfa", accepted: "#34d399", rejected: "#f87171" };
const FILTERS = ["all", "new", "reviewing", "accepted", "rejected"] as const;

export default function AdminInterns() {
  useRequireRole(["admin"]);
  const [apps, setApps] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    listApplications().then(setApps).catch(() => setApps([])).finally(() => setLoading(false));
  }, []);

  const set = async (a: InternshipApplication, status: NonNullable<InternshipApplication["status"]>) => {
    if (!a.$id) return;
    setBusy(a.$id);
    try { const u = await setApplicationStatus(a.$id, status); setApps((p) => p.map((x) => (x.$id === u.$id ? u : x))); }
    finally { setBusy(""); }
  };

  const shown = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <>
      <PageHeader title="Internship Applications" subtitle="Review and manage applicants" />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === "all" ? apps.length : apps.filter((a) => a.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${filter === f ? "bg-aura-purple/20 border-aura-purple/50 text-white" : "border-white/10 text-gray-400 hover:text-white"}`}>
              {f} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : shown.length === 0 ? (
        <div className="glass-card p-10 text-center"><GraduationCap size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No applications in this view.</p></div>
      ) : (
        <div className="space-y-3">
          {shown.map((a) => (
            <div key={a.$id} className="glass-card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-white font-semibold">{a.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: `${STATUS[a.status ?? "new"]}22`, color: STATUS[a.status ?? "new"] }}>{a.status}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-aura-purple/15 text-aura-purple">{a.area}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5"><Mail size={12} /> {a.email}</span>
                    {a.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {a.phone}</span>}
                  </p>
                  {a.experience && <p className="text-sm text-gray-400 mt-2"><span className="text-gray-500">Experience:</span> {a.experience}</p>}
                  {a.message && <p className="text-sm text-gray-400 mt-1">{a.message}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.status !== "reviewing" && <button onClick={() => set(a, "reviewing")} disabled={!!busy} className="btn-secondary !p-2" title="Mark reviewing">{busy === a.$id ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}</button>}
                  {a.status !== "accepted" && <button onClick={() => set(a, "accepted")} disabled={!!busy} className="btn-secondary !p-2 text-emerald-300" title="Accept"><Check size={13} /></button>}
                  {a.status !== "rejected" && <button onClick={() => set(a, "rejected")} disabled={!!busy} className="btn-secondary !p-2 text-red-300" title="Reject"><X size={13} /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Tip: accept an applicant, then create their intern account with{" "}
        <code className="text-aura-cyan">role &quot;intern&quot;</code> (via Supabase or the seed) so they can log in to the trainee portal.
      </p>
    </>
  );
}
