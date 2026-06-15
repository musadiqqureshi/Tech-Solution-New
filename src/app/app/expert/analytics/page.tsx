"use client";

import { BarChart3 } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ExpertAnalytics() {
  useRequireRole(["expert", "admin"]);
  return (
    <>
      <PageHeader title="Analytics" subtitle="Your performance" />
      <ComingSoon
        icon={BarChart3}
        title="Expert analytics"
        note="Charts for earnings, completed projects, and active projects. Arrives later in Stage 2."
      />
    </>
  );
}
