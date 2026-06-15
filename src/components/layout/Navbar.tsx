"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { NAV_LINKS, COMPANY } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, configured } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0a0a1a]/80 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
            <Sparkles size={18} className="text-white" />
          </span>
          <span className="text-white">
            Tech<span className="gradient-text">Solutions</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/app" className="btn-primary !py-2 !px-5 text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link href="/register" className="btn-primary !py-2 !px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden backdrop-blur-xl bg-[#0a0a1a]/95 border-b border-white/10 px-4 py-4 space-y-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-gray-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex gap-3">
            <Link href="/login" className="btn-secondary flex-1 !py-2 text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary flex-1 !py-2 text-sm">
              Get Started
            </Link>
          </div>
          {!configured && (
            <p className="text-[11px] text-amber-400/80 pt-1">
              Demo mode — connect Supabase to enable auth.
            </p>
          )}
        </div>
      )}
    </header>
  );
}
