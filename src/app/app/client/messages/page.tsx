"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import ChatThread from "@/components/app/ChatThread";

export default function ClientMessages() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Messages" subtitle="Chat with the Tech Solutions team" />
      {user ? (
        <ChatThread
          peerId={user.id}
          peerName="Tech Solutions Support"
          me={{ id: user.id, name: user.name, isAdmin: false }}
        />
      ) : (
        <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-aura-cyan" /></div>
      )}
    </>
  );
}
