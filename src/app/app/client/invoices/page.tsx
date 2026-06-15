"use client";

import { FileText } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ClientInvoices() {
  useRequireRole(["client", "admin"]);
  return (
    <>
      <PageHeader title="Invoices" subtitle="Payment history and downloads" />
      <ComingSoon
        icon={FileText}
        title="Invoices"
        note="Download invoices and view payment history with multi-currency support (USD, PKR, GBP, EUR, AUD, CAD). Arrives later in Stage 2."
      />
    </>
  );
}
