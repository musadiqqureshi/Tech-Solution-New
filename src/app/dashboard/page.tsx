"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FolderKanban, ListChecks, FileText, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/ui";
import { useCompany } from "@/components/saas/SaasShell";
import {
  PLAN_LABEL, listClients, listProjects, listSaasTasks, listSaasInvoices,
} from "@/lib/saas";

export default function CompanyDashboard() {
  const company = useCompany();
  const cid = company?.id ?? "";
  const [stats, setStats] = useState({ clients: 0, projects: 0, openTasks: 0, unpaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cid) return;
    Promise.all([listClients(cid), listProjects(cid), listSaasTasks(cid), listSaasInvoices(cid)])
      .then(([c, p, t, i]) => setStats({
        clients: c.length,
        projects: p.filter((x) => x.status === "active").length,
        openTasks: t.filter((x) => x.status !== "done").length,
        unpaid: i.filter((x) => x.status === "unpaid").length,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cid]);

  return (
    <>
      <PageHeader title={`Welcome${company ? `, ${company.name}` : ""}`} subtitle="Your company workspace" />

      <div className="glass-card p-5 mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div><p className="text-xs text-gray-500 uppercase tracking-widest">Plan</p><p className="text-white font-bold">{company ? PLAN_LABEL[company.plan] : "—"}</p></div>
        <div><p className="text-xs text-gray-500 uppercase tracking-widest">Status</p><p className="text-white font-bold capitalize">{company?.status}</p></div>
        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400">Billing activation pending</span>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 size={26} className="animate-spin text-aura-cyan" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/dashboard/clients"><StatCard icon={Users} label="Clients" value={String(stats.clients)} color="purple" index={0} /></Link>
            <Link href="/dashboard/projects"><StatCard icon={FolderKanban} label="Active Projects" value={String(stats.projects)} color="blue" index={1} /></Link>
            <Link href="/dashboard/tasks"><StatCard icon={ListChecks} label="Open Tasks" value={String(stats.openTasks)} color="cyan" index={2} /></Link>
            <Link href="/dashboard/invoices"><StatCard icon={FileText} label="Unpaid Invoices" value={String(stats.unpaid)} color="gold" index={3} /></Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/dashboard/clients", label: "Add a client", icon: Users },
              { href: "/dashboard/projects", label: "Start a project", icon: FolderKanban },
              { href: "/dashboard/tasks", label: "Plan tasks", icon: ListChecks },
              { href: "/dashboard/invoices", label: "Send an invoice", icon: FileText },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="glass-card glass-card-hover p-5 flex items-center gap-3 group">
                <q.icon size={20} className="text-aura-cyan" />
                <span className="text-white font-medium flex-1">{q.label}</span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
