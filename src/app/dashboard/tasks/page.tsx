"use client";

import { ListChecks } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Tasks" subtitle="Company workspace" />
      <ComingSoon icon={ListChecks} title="Tasks" note="Break projects into tasks and assign them to your team. Rolling out next." />
    </>
  );
}
