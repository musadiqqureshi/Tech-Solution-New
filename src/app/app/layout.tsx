import PortalGuard from "@/components/app/PortalGuard";
import Sidebar from "@/components/app/Sidebar";
import NotificationBell from "@/components/app/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import { NotificationsProvider } from "@/context/NotificationsContext";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalGuard>
      <NotificationsProvider>
        <div className="min-h-screen bg-aura-mesh flex">
          <Sidebar />
          <NotificationBell />
          <ThemeToggle className="fixed top-2.5 right-28 lg:top-4 lg:right-16 z-50 glass-card" />
          <main className="flex-1 min-w-0 px-4 sm:px-8 pt-20 lg:pt-8 pb-12 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </NotificationsProvider>
    </PortalGuard>
  );
}
