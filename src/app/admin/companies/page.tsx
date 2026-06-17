"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Building2, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { listAllCompanies, adminUpdateCompany, deleteCompany, PLAN_LABEL, type Company, type CompanyPlan, type CompanyStatus } from "@/lib/saas";

const PLANS: CompanyPlan[] = ["starter", "professional", "enterprise"];
const STATUSES: CompanyStatus[] = ["trialing", "active", "suspended", "cancelled", "pending"];
const STATUS_COLOR: Record<CompanyStatus, string> = {
  trialing: "#fbbf24", active: "#34d399", suspended: "#f87171", cancelled: "#6b7280", pending: "#60a5fa",
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    listAllCompanies().then(setCompanies).catch(() => setCompanies([])).finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    [companies, q]
  );

  const setPlan = async (c: Company, plan: CompanyPlan) => {
    setBusy(c.id);
    try { const u = await adminUpdateCompany(c.id, { plan }); setCompanies((p) => p.map((x) => (x.id === c.id ? u : x))); }
    finally { setBusy(""); }
  };
  const setStatus = async (c: Company, status: CompanyStatus) => {
    setBusy(c.id);
    try { const u = await adminUpdateCompany(c.id, { status }); setCompanies((p) => p.map((x) => (x.id === c.id ? u : x))); }
    finally { setBusy(""); }
  };
  const del = async (c: Company) => {
    if (!confirm(`Delete ${c.name} and all its data? This cannot be undone.`)) return;
    setBusy(c.id);
    try { await deleteCompany(c.id); setCompanies((p) => p.filter((x) => x.id !== c.id)); }
    finally { setBusy(""); }
  };

  const sel = "bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-aura-purple/50";

  return (
    <>
      <PageHeader title="Companies" subtitle="Manage every subscribed company" />

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50" />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : shown.length === 0 ? (
        <div className="glass-card p-10 text-center"><Building2 size={26} className="text-aura-cyan mx-auto mb-3" /><p className="text-sm text-gray-400">No companies found.</p></div>
      ) : (
        <div className="space-y-3">
          {shown.map((c) => (
            <div key={c.id} className="glass-card p-5 flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-white font-semibold truncate">{c.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLOR[c.status]}22`, color: STATUS_COLOR[c.status] }}>{c.status}</span>
                  {busy === c.id && <Loader2 size={13} className="animate-spin text-aura-cyan" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {PLAN_LABEL[c.plan]} · joined {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select className={sel} value={c.plan} onChange={(e) => setPlan(c, e.target.value as CompanyPlan)} disabled={!!busy}>
                  {PLANS.map((p) => (<option key={p} value={p}>{PLAN_LABEL[p]}</option>))}
                </select>
                <select className={sel} value={c.status} onChange={(e) => setStatus(c, e.target.value as CompanyStatus)} disabled={!!busy}>
                  {STATUSES.map((s) => (<option key={s} value={s} className="capitalize">{s}</option>))}
                </select>
                <button onClick={() => del(c)} disabled={!!busy} className="btn-secondary !p-2 text-red-300" title="Delete company"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
