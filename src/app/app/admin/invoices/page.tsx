"use client";

import { Wallet } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function AdminInvoices() {
  useRequireRole(["admin"]);
  return (
    <>
      <PageHeader title="Invoice Management" subtitle="Automatic and manual invoices" />
      <ComingSoon
        icon={Wallet}
        title="Invoice management"
        note="Auto-generate invoices from orders or create manual ones, with branded PDF templates and payment tracking. Arrives in Stage 3."
      />
    </>
  );
}
