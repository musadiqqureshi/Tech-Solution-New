"use client";

import { LifeBuoy } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Support Tickets" subtitle="Company workspace" />
      <ComingSoon icon={LifeBuoy} title="Support Tickets" note="Handle client support requests in one place. Rolling out next." />
    </>
  );
}
