"use client";

import { ShoppingBag } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ClientOrders() {
  useRequireRole(["client", "admin"]);
  return (
    <>
      <PageHeader title="Orders" subtitle="Create and track your projects" />
      <ComingSoon
        icon={ShoppingBag}
        title="Orders system"
        note="Create orders (TSP-YYYYMM-XXXX), upload requirements, track status, and download deliverables. Building out next in Stage 2."
      />
    </>
  );
}
