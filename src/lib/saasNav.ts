import {
  LayoutDashboard, Users, FolderKanban, ListChecks, UsersRound,
  FileText, LifeBuoy, Settings, type LucideIcon,
} from "lucide-react";

export interface SaasNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const SAAS_NAV: SaasNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListChecks },
  { label: "Team", href: "/dashboard/team", icon: UsersRound },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Tickets", href: "/dashboard/tickets", icon: LifeBuoy },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
