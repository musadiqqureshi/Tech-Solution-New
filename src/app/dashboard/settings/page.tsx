"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import { updateCompany, PLAN_LABEL } from "@/lib/saas";

export default function CompanySettings() {
  const company = useCompany();
  const [name, setName] = useState(company?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!company?.id || !name.trim()) return;
    setSaving(true);
    try {
      await updateCompany(company.id, { name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const input = "mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-aura-purple/50";
  const label = "text-xs font-semibold text-gray-400 uppercase tracking-widest";

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your company workspace" />

      <div className="glass-card p-6 max-w-2xl space-y-5">
        <label className="block">
          <span className={label}>Company name</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <span className={label}>Plan</span>
            <p className="mt-2 text-white font-bold">{company ? PLAN_LABEL[company.plan] : "—"}</p>
          </div>
          <div>
            <span className={label}>Status</span>
            <p className="mt-2 text-white font-bold capitalize">{company?.status}</p>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary !py-2.5 text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="glass-card p-6 max-w-2xl mt-5 border border-aura-purple/30">
        <h3 className="text-sm font-bold text-white mb-1">Billing</h3>
        <p className="text-sm text-gray-400 mb-3">
          Generate a PKR invoice for your plan at the live USD rate, pay by bank transfer, and
          upload your payment screenshot to activate.
        </p>
        <a href="/dashboard/billing" className="btn-primary !py-2 text-sm">Go to Billing</a>
      </div>
    </>
  );
}
