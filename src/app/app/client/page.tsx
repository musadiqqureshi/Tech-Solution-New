"use client";

import { Wallet, ShoppingBag, PackageCheck, CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";

export default function ClientDashboard() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle="Your projects at a glance"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Wallet} label="Total Spend" value="$0" color="purple" index={0} />
        <StatCard icon={ShoppingBag} label="Active Orders" value="0" color="blue" index={1} />
        <StatCard icon={PackageCheck} label="Delivered" value="0" color="cyan" index={2} />
        <StatCard icon={CalendarDays} label="Meetings" value="0" color="gold" index={3} />
      </div>

      <div className="glass-card p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">No orders yet</h2>
        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
          Start your first project and track its progress, deliverables, and
          invoices right here.
        </p>
        <a href="/app/client/orders" className="btn-primary">
          <Plus size={18} /> Create Order
        </a>
      </div>
    </>
  );
}
