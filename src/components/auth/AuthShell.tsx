"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { configured } = useAuth();
  return (
    <main className="min-h-screen bg-aura-mesh flex items-center justify-center px-4 py-16">
      <div className="orb w-96 h-96 top-1/4 left-1/4 bg-aura-purple" style={{ filter: "blur(130px)", opacity: 0.14 }} />
      <div className="orb w-80 h-80 bottom-1/4 right-1/4 bg-aura-cyan" style={{ filter: "blur(110px)", opacity: 0.12 }} />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-black text-xl mb-8">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
            <Sparkles size={20} className="text-white" />
          </span>
          <span className="text-white">
            Tech<span className="gradient-text">Solutions</span>
          </span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-black text-white mb-1">{title}</h1>
          <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

          {!configured && (
            <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
              Demo mode: Supabase isn’t configured yet. Add your credentials to
              <code className="mx-1">.env.local</code> to enable authentication.
            </div>
          )}

          {children}
        </div>
      </div>
    </main>
  );
}
