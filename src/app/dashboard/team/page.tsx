"use client";

import { useEffect, useState } from "react";
import { Loader2, UsersRound, Shield } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import { listMembers, type CompanyMember } from "@/lib/saas";

export default function TeamPage() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cid) return;
    listMembers(cid).then(setMembers).catch(() => setMembers([])).finally(() => setLoading(false));
  }, [cid]);

  return (
    <>
      <PageHeader title="Team" subtitle="People in your workspace" />

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.userId} className="glass-card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30 grid place-items-center text-white font-bold shrink-0">
                {(m.name ?? m.email ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold truncate">{m.name ?? "—"}</p>
                <p className="text-xs text-gray-500 truncate">{m.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-aura-purple/15 text-aura-purple capitalize flex items-center gap-1.5">
                <Shield size={12} /> {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card p-6 mt-5 border border-amber-500/30">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><UsersRound size={16} className="text-aura-cyan" /> Invite teammates</h3>
        <p className="text-sm text-gray-400">
          Email invitations are coming next. For now, your workspace owner can manage everything;
          teammate seats are included in your plan.
        </p>
      </div>
    </>
  );
}
