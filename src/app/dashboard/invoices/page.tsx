"use client";

import { FileText } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Invoices" subtitle="Company workspace" />
      <ComingSoon icon={FileText} title="Invoices" note="Bill your clients and track payments. Rolling out next." />
    </>
  );
}
