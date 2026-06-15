"use client";

import { ListTodo } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader, ComingSoon } from "@/components/app/ui";

export default function AdminTasks() {
  useRequireRole(["admin"]);
  return (
    <>
      <PageHeader title="Task Management" subtitle="Assign work and set budgets" />
      <ComingSoon
        icon={ListTodo}
        title="Task management"
        note="Assign tasks, set expert and client budgets, and track deadlines. Profit = Client Budget − Expert Budget, visible to admins only. Arrives in Stage 3."
      />
    </>
  );
}
