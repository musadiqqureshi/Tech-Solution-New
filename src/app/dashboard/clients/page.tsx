"use client";

import { Users } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Clients" subtitle="Company workspace" />
      <ComingSoon icon={Users} title="Clients" note="Add and manage your clients. Each client stays private to your company. Rolling out next." />
    </>
  );
}
