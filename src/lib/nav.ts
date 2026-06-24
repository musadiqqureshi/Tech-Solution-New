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
  MessageSquare,
  GraduationCap,
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
  intern: "/app/expert",
};

export const NAV: Record<UserRole, NavItem[]> = {
  client: [
    { label: "Dashboard", href: "/app/client", icon: LayoutDashboard },
    { label: "Orders", href: "/app/client/orders", icon: ShoppingBag },
    { label: "Meetings", href: "/app/client/meetings", icon: CalendarDays },
    { label: "Messages", href: "/app/client/messages", icon: MessageSquare },
    { label: "Invoices", href: "/app/client/invoices", icon: FileText },
    { label: "Profile", href: "/app/client/profile", icon: User },
  ],
  expert: [
    { label: "Dashboard", href: "/app/expert", icon: LayoutDashboard },
    { label: "Tasks", href: "/app/expert/tasks", icon: ListTodo },
    { label: "Messages", href: "/app/expert/messages", icon: MessageSquare },
    { label: "Analytics", href: "/app/expert/analytics", icon: BarChart3 },
    { label: "Profile", href: "/app/expert/profile", icon: User },
  ],
  intern: [
    { label: "Dashboard", href: "/app/expert", icon: LayoutDashboard },
    { label: "Training Tasks", href: "/app/expert/tasks", icon: ListTodo },
    { label: "Messages", href: "/app/expert/messages", icon: MessageSquare },
    { label: "Progress", href: "/app/expert/analytics", icon: BarChart3 },
    { label: "Profile", href: "/app/expert/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/app/admin/orders", icon: ShoppingBag },
    { label: "Meetings", href: "/app/admin/meetings", icon: CalendarDays },
    { label: "Messages", href: "/app/admin/messages", icon: MessageSquare },
    { label: "Experts", href: "/app/admin/experts", icon: Users },
    { label: "Interns", href: "/app/admin/interns", icon: GraduationCap },
    { label: "Tasks", href: "/app/admin/tasks", icon: ListTodo },
    { label: "Invoices", href: "/app/admin/invoices", icon: Wallet },
    { label: "Reports", href: "/app/admin/reports", icon: BarChart3 },
  ],
};
