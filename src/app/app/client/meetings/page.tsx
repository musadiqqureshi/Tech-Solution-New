"use client";

import { CalendarDays } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ClientMeetings() {
  useRequireRole(["client", "admin"]);
  return (
    <>
      <PageHeader title="Meetings" subtitle="Schedule consultations" />
      <ComingSoon
        icon={CalendarDays}
        title="Meetings module"
        note="Request meetings, schedule consultations, and add them to Google Calendar. Arrives later in Stage 2."
      />
    </>
  );
}
