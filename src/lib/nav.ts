import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  FileText,
  User,
  ListTodo,
  BarChart3,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Role home — where /app redirects each role after auth. */
export const ROLE_HOME: Record<UserRole, string> = {
  client: "/app/client",
  expert: "/app/expert",
  admin: "/app/admin",
};

export const NAV: Record<UserRole, NavItem[]> = {
  client: [
    { label: "Dashboard", href: "/app/client", icon: LayoutDashboard },
    { label: "Orders", href: "/app/client/orders", icon: ShoppingBag },
    { label: "Meetings", href: "/app/client/meetings", icon: CalendarDays },
    { label: "Invoices", href: "/app/client/invoices", icon: FileText },
    { label: "Profile", href: "/app/client/profile", icon: User },
  ],
  expert: [
    { label: "Dashboard", href: "/app/expert", icon: LayoutDashboard },
    { label: "Tasks", href: "/app/expert/tasks", icon: ListTodo },
    { label: "Analytics", href: "/app/expert/analytics", icon: BarChart3 },
    { label: "Profile", href: "/app/expert/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/app/admin/orders", icon: ShoppingBag },
    { label: "Experts", href: "/app/admin/experts", icon: Users },
    { label: "Tasks", href: "/app/admin/tasks", icon: ListTodo },
    { label: "Invoices", href: "/app/admin/invoices", icon: Wallet },
    { label: "Reports", href: "/app/admin/reports", icon: BarChart3 },
  ],
};
