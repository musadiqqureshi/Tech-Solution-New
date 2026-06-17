"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, Users, BadgeCheck, Clock, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/ui";
import { listAllCompanies, listAllMembers, PLAN_LABEL, type Company } from "@/lib/saas";

const PIE = ["#a78bfa", "#60a5fa", "#22d3ee", "#fbbf24", "#34d399", "#f87171"];

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [seats, setSeats] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllCompanies().catch(() => []), listAllMembers().catch(() => [])])
      .then(([c, m]) => { setCompanies(c); setSeats(m.length); })
      .finally(() => setLoading(false));
  }, []);

  const active = companies.filter((c) => c.status === "active").length;
  const trialing = companies.filter((c) => c.status === "trialing").length;
  const byPlan = (["starter", "professional", "enterprise"] as const).map((p) => ({
    name: PLAN_LABEL[p], value: companies.filter((c) => c.plan === p).length,
  })).filter((x) => x.value > 0);

  return (
    <>
      <PageHeader title="Platform Overview" subtitle="All Tech Solutions SaaS companies" />

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Building2} label="Companies" value={String(companies.length)} color="purple" index={0} />
            <StatCard icon={BadgeCheck} label="Active" value={String(active)} color="cyan" index={1} />
            <StatCard icon={Clock} label="Trialing" value={String(trialing)} color="gold" index={2} />
            <StatCard icon={Users} label="Total Seats" value={String(seats)} color="blue" index={3} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-8">
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Companies by Plan</h2>
              {byPlan.length === 0 ? (
                <p className="text-sm text-gray-500 py-12 text-center">No companies yet.</p>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byPlan} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {byPlan.map((_, i) => (<Cell key={i} fill={PIE[i % PIE.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#14142a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Companies</h2>
                <Link href="/admin/companies" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1">Manage <ArrowRight size={14} /></Link>
              </div>
              {companies.length === 0 ? (
                <p className="text-sm text-gray-500 py-12 text-center">No companies yet.</p>
              ) : (
                <div className="space-y-2">
                  {companies.slice(0, 6).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                      <div className="min-w-0 flex-1"><p className="text-sm text-white font-semibold truncate">{c.name}</p><p className="text-xs text-gray-500">{PLAN_LABEL[c.plan]}</p></div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 capitalize">{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
