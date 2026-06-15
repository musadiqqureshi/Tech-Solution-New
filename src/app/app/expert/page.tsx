"use client";

import { ListTodo, Clock, CheckCircle2, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, StatCard } from "@/components/app/ui";

export default function ExpertDashboard() {
  useRequireRole(["expert", "admin"]);
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle="Your assigned work and earnings"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ListTodo} label="Assigned Tasks" value="0" color="purple" index={0} />
        <StatCard icon={Clock} label="In Progress" value="0" color="blue" index={1} />
        <StatCard icon={CheckCircle2} label="Completed" value="0" color="cyan" index={2} />
        <StatCard icon={Wallet} label="Earnings" value="$0" color="gold" index={3} />
      </div>

      <div className="glass-card p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">No tasks assigned</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          When an admin assigns you a task, it will appear here with its
          deadline and budget. Client details and project profit stay hidden.
        </p>
      </div>
    </>
  );
}
