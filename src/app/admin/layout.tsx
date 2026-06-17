import SuperAdminShell from "@/components/saas/SuperAdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
