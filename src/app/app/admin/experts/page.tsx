"use client";

import { Users } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function AdminExperts() {
  useRequireRole(["admin"]);
  return (
    <>
      <PageHeader title="Expert Management" subtitle="Manage your expert roster" />
      <ComingSoon
        icon={Users}
        title="Expert management"
        note="Add, edit, and remove experts, assign logins, and toggle homepage visibility. The experts collection is already provisioned. Arrives in Stage 3."
      />
    </>
  );
}
