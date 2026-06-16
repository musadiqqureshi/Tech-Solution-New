"use client";

import { UsersRound } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="Team" subtitle="Company workspace" />
      <ComingSoon icon={UsersRound} title="Team" note="Invite teammates and manage their roles. Rolling out next." />
    </>
  );
}
