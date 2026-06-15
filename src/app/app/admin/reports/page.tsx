"use client";

import { BarChart3 } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function AdminReports() {
  useRequireRole(["admin"]);
  return (
    <>
      <PageHeader title="Business Reports" subtitle="Monthly performance" />
      <ComingSoon
        icon={BarChart3}
        title="Monthly business reports"
        note="Downloadable PDF reports covering revenue, costs, profit, orders, services, and payment status. Arrives in Stage 3."
      />
    </>
  );
}
