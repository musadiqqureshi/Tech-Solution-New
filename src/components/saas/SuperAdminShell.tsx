"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Building2, LayoutDashboard, Tag, LogOut, Menu, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Plans", href: "/admin/plans", icon: Tag },
];

export default function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/app");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="min-h-screen bg-aura-mesh grid place-items-center"><Loader2 size={30} className="animate-spin text-aura-cyan" /></div>;
  }

  const signOut = async () => { await logout(); router.push("/"); };

  const Brand = (
    <Link href="/admin" className="flex items-center gap-2 font-black text-lg">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan"><Shield size={18} className="text-white" /></span>
      <span className="text-white">Super Admin</span>
    </Link>
  );
  const Nav = (
    <nav className="space-y-1">
      {NAV.map((i) => {
        const active = pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href));
        return (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-gradient-to-r from-aura-purple/30 to-aura-cyan/15 text-white border border-aura-purple/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            <i.icon size={18} /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
  const Footer = (
    <div className="mt-auto pt-4 border-t border-white/10">
      <Link href="/app/admin" className="block text-xs text-aura-cyan hover:underline px-3 mb-3">← Agency admin</Link>
      <button onClick={signOut} className="btn-secondary w-full !py-2 text-sm"><LogOut size={16} /> Sign out</button>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 backdrop-blur-xl bg-[#0a0a1a]/85 border-b border-white/10">
        {Brand}
        <button onClick={() => setOpen(true)} className="text-white p-2"><Menu size={22} /></button>
      </div>
      <div className="min-h-screen bg-aura-mesh flex">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 p-5 border-r border-white/10 bg-[#080816]">
          {Brand}<div className="mt-8 flex-1">{Nav}</div>{Footer}
        </aside>
        {open && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col p-5 bg-[#080816] border-r border-white/10">
              <div className="flex items-center justify-between">{Brand}<button onClick={() => setOpen(false)} className="text-white p-2"><X size={20} /></button></div>
              <div className="mt-8 flex-1">{Nav}</div>{Footer}
            </aside>
          </div>
        )}
        <main className="flex-1 min-w-0 px-4 sm:px-8 pt-20 lg:pt-8 pb-12 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </>
  );
}
