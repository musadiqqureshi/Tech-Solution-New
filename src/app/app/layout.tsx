import PortalGuard from "@/components/app/PortalGuard";
import Sidebar from "@/components/app/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalGuard>
      <div className="min-h-screen bg-aura-mesh flex">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-8 pt-20 lg:pt-8 pb-12 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </PortalGuard>
  );
}
