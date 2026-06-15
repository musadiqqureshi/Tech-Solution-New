"use client";

import { TrendingUp, DollarSign, Briefcase, Users, UserCog } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";

export default function AdminDashboard() {
  useRequireRole(["admin"]);

  return (
    <>
      <PageHeader title="Admin Overview" subtitle="Operational control center" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value="$0" color="purple" index={0} />
        <StatCard icon={TrendingUp} label="Est. Profit" value="$0" color="cyan" index={1} />
        <StatCard icon={Briefcase} label="Active Projects" value="0" color="blue" index={2} />
        <StatCard icon={Users} label="Clients" value="0" color="gold" index={3} />
        <StatCard icon={UserCog} label="Experts" value="0" color="purple" index={4} />
      </div>

      <div className="glass-card p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Revenue analytics</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Revenue trends, profit breakdowns, and service performance charts build
          out here in Stage 3. Order, expert, and task management are available
          from the sidebar.
        </p>
      </div>
    </>
  );
}
