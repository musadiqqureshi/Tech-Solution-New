import PortalGuard from "@/components/app/PortalGuard";
import Sidebar from "@/components/app/Sidebar";
import NotificationBell from "@/components/app/NotificationBell";
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
          <main className="flex-1 min-w-0 px-4 sm:px-8 pt-20 lg:pt-8 pb-12 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </NotificationsProvider>
    </PortalGuard>
  );
}
