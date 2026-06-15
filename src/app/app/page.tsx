"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const roleCopy: Record<string, { title: string; note: string }> = {
  client: { title: "Client Portal", note: "Orders, meetings, and invoices arrive in Stage 2." },
  expert: { title: "Expert Workspace", note: "Your assigned tasks and analytics arrive in Stage 2." },
  admin: { title: "Admin Dashboard", note: "Full operational control arrives in Stage 3." },
};

export default function AppHome() {
  const { user, loading, logout, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, user, configured, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-aura-mesh grid place-items-center">
        <Loader2 size={32} className="animate-spin text-aura-cyan" />
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="min-h-screen bg-aura-mesh grid place-items-center px-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-xl font-black text-white mb-2">Portal coming online</h1>
          <p className="text-sm text-gray-400 mb-6">
            Connect Appwrite (set <code>NEXT_PUBLIC_APPWRITE_PROJECT_ID</code>) to
            enable authenticated portals.
          </p>
          <Link href="/" className="btn-secondary">Back to site</Link>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const copy = roleCopy[user.role];

  return (
    <main className="min-h-screen bg-aura-mesh px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-aura-purple to-aura-cyan">
                <LayoutDashboard size={22} className="text-white" />
              </span>
              <div>
                <h1 className="text-xl font-black text-white">{copy.title}</h1>
                <p className="text-sm text-gray-400">
                  Welcome, {user.name} ·{" "}
                  <span className="text-aura-cyan capitalize">{user.role}</span>
                </p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="btn-secondary !py-2 !px-4 text-sm">
              <LogOut size={16} /> Sign out
            </button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-gray-300">{copy.note}</p>
            <p className="text-xs text-gray-500 mt-2">
              Stage 1 (marketing + auth + leads) is live. Portals build out in Stages 2 & 3.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
