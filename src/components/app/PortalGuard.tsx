"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HOME } from "@/lib/nav";
import type { UserRole } from "@/lib/types";

/**
 * Wraps the authenticated portal. Redirects unauthenticated users to /login,
 * and keeps each user inside the area that matches their role.
 */
export default function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!configured) return; // demo mode handled below
    if (!user) {
      router.replace("/login");
      return;
    }
    // Keep users within their own role area (admin may roam).
    const home = ROLE_HOME[user.role];
    const allowedPrefix = `/app/${user.role}`;
    if (
      user.role !== "admin" &&
      pathname.startsWith("/app/") &&
      !pathname.startsWith(allowedPrefix) &&
      pathname !== "/app"
    ) {
      router.replace(home);
    }
  }, [loading, user, configured, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aura-mesh grid place-items-center">
        <Loader2 size={32} className="animate-spin text-aura-cyan" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-aura-mesh grid place-items-center px-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-xl font-black text-white mb-2">Portal coming online</h1>
          <p className="text-sm text-gray-400 mb-6">
            Connect Supabase (set <code>NEXT_PUBLIC_SUPABASE_URL</code> /
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and run <code>npm run setup:db</code>)
            to enable the authenticated portals.
          </p>
          <Link href="/" className="btn-secondary">Back to site</Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

/** Guard a page to specific roles (defense-in-depth alongside PortalGuard). */
export function useRequireRole(roles: UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && !roles.includes(user.role)) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [loading, user, roles, router]);
}
