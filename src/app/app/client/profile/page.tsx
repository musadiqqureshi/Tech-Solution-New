"use client";

import { User } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ClientProfile() {
  useRequireRole(["client", "admin"]);
  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <ComingSoon
        icon={User}
        title="Profile management"
        note="Edit your name, company, phone, and email. Arrives later in Stage 2."
      />
    </>
  );
}
