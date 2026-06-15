"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HOME } from "@/lib/nav";

/** Sends each authenticated user to their role's dashboard. */
export default function AppIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(ROLE_HOME[user.role]);
  }, [loading, user, router]);

  return (
    <div className="grid place-items-center py-32">
      <Loader2 size={28} className="animate-spin text-aura-cyan" />
    </div>
  );
}
