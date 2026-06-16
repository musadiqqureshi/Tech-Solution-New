"use client";

import { FolderKanban } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Projects" subtitle="Company workspace" />
      <ComingSoon icon={FolderKanban} title="Projects" note="Create projects, set deadlines and budgets, and track progress. Rolling out next." />
    </>
  );
}
