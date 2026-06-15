"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NAV } from "@/lib/nav";
import type { UserRole } from "@/lib/types";

function NavList({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV[role].map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== `/app/${role}` && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-gradient-to-r from-aura-purple/30 to-aura-cyan/15 text-white border border-aura-purple/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  const Brand = (
    <Link href="/" className="flex items-center gap-2 font-black text-lg">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
        <Sparkles size={18} className="text-white" />
      </span>
      <span className="text-white">
        Tech<span className="gradient-text">Solutions</span>
      </span>
    </Link>
  );

  const Footer = (
    <div className="mt-auto pt-4 border-t border-white/10">
      <div className="flex items-center gap-3 px-3 py-2 mb-2">
        <div className="w-9 h-9 rounded-full grid place-items-center font-bold text-white bg-gradient-to-br from-aura-purple to-aura-cyan">
          {user.name?.charAt(0) ?? "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-aura-cyan capitalize">{user.role}</p>
        </div>
      </div>
      <button onClick={signOut} className="btn-secondary w-full !py-2 text-sm">
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 backdrop-blur-xl bg-[#0a0a1a]/85 border-b border-white/10">
        {Brand}
        <button onClick={() => setOpen(true)} className="text-white p-2" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 p-5 border-r border-white/10 bg-[#080816]">
        {Brand}
        <div className="mt-8 flex-1">
          <NavList role={user.role} />
        </div>
        {Footer}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col p-5 bg-[#080816] border-r border-white/10">
            <div className="flex items-center justify-between">
              {Brand}
              <button onClick={() => setOpen(false)} className="text-white p-2" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <div className="mt-8 flex-1">
              <NavList role={user.role} onNavigate={() => setOpen(false)} />
            </div>
            {Footer}
          </aside>
        </div>
      )}
    </>
  );
}
