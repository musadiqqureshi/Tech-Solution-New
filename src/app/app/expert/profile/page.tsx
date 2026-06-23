"use client";

import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import ProfileForm from "@/components/app/ProfileForm";

export default function ExpertProfile() {
  useRequireRole(["expert", "admin", "intern"]);
  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <ProfileForm />
    </>
  );
}
