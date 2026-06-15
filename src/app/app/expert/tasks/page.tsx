"use client";

import { ListTodo } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function ExpertTasks() {
  useRequireRole(["expert", "admin"]);
  return (
    <>
      <PageHeader title="Tasks" subtitle="Your assigned work" />
      <ComingSoon
        icon={ListTodo}
        title="Task dashboard"
        note="View assigned tasks with title, description, deadline, and budget. Workflow: assigned → in_progress → submitted → approved → completed. Building out next in Stage 2."
      />
    </>
  );
}
