"use client";

import { User } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ExpertProfile() {
  useRequireRole(["expert", "admin"]);
  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <ComingSoon
        icon={User}
        title="Profile management"
        note="Edit your name, skills, and availability. Arrives later in Stage 2."
      />
    </>
  );
}
