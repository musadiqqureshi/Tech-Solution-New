"use client";

import { Users, FolderKanban, ListChecks, FileText } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import { PLAN_LABEL } from "@/lib/saas";

export default function CompanyDashboard() {
  const company = useCompany();
  return (
    <>
      <PageHeader
        title={`Welcome${company ? `, ${company.name}` : ""}`}
        subtitle="Your company workspace"
      />

      <div className="glass-card p-5 mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Plan</p>
          <p className="text-white font-bold">{company ? PLAN_LABEL[company.plan] : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Status</p>
          <p className="text-white font-bold capitalize">{company?.status}</p>
        </div>
        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400">
          Billing activation pending
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Clients" value="0" color="purple" index={0} />
        <StatCard icon={FolderKanban} label="Projects" value="0" color="blue" index={1} />
        <StatCard icon={ListChecks} label="Open Tasks" value="0" color="cyan" index={2} />
        <StatCard icon={FileText} label="Unpaid Invoices" value="0" color="gold" index={3} />
      </div>

      <div className="glass-card p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Your workspace is ready 🎉</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Clients, projects, tasks, team, invoices, and support tickets are rolling out next.
          Everything you add stays private to your company.
        </p>
      </div>
    </>
  );
}
