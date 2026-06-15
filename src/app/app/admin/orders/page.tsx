"use client";

import { ShoppingBag } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function AdminOrders() {
  useRequireRole(["admin"]);
  return (
    <>
      <PageHeader title="Orders Management" subtitle="Approve, deliver, and track all orders" />
      <ComingSoon
        icon={ShoppingBag}
        title="Orders management"
        note="Approve/reject orders, start and deliver projects, mark paid/unpaid, and upload deliverables. Arrives in Stage 3."
      />
    </>
  );
}
