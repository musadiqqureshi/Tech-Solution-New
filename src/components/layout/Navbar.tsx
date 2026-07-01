"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { NAV_LINKS, SERVICES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const { user, configured } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => {
    setOpen(false);
    setMobileServices(false);
  };

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
          {NAV_LINKS.map((l) =>
            l.label === "Services" ? (
              <div key={l.href} className="relative group h-16 flex items-center">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Services <ChevronDown size={14} className="mt-0.5 transition-transform group-hover:rotate-180" />
                </Link>

                {/* Dropdown */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                  <div className="w-[560px] rounded-2xl border border-white/10 bg-[#0e0e22]/95 backdrop-blur-xl shadow-2xl p-3">
                    <div className="grid grid-cols-2 gap-1">
                      {SERVICES.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                        >
                          <span className="w-9 h-9 shrink-0 rounded-lg grid place-items-center bg-aura-purple/15 group-hover/item:bg-aura-purple/25 transition-colors">
                            <s.icon size={18} className="text-aura-purple" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">{s.title}</span>
                            <span className="block text-xs text-gray-500 truncate">{s.tagline}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/services"
                      className="mt-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-aura-cyan hover:bg-white/5 transition-colors"
                    >
                      View all services <ChevronDown size={14} className="-rotate-90" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
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
        <div className="lg:hidden backdrop-blur-xl bg-[#0a0a1a]/95 border-b border-white/10 px-4 py-4 space-y-1">
          {NAV_LINKS.map((l) =>
            l.label === "Services" ? (
              <div key={l.href}>
                <button
                  onClick={() => setMobileServices((v) => !v)}
                  className="w-full flex items-center justify-between py-2 text-gray-300 hover:text-white"
                >
                  Services
                  <ChevronDown size={16} className={`transition-transform ${mobileServices ? "rotate-180" : ""}`} />
                </button>
                {mobileServices && (
                  <div className="pl-3 border-l border-white/10 ml-1 mb-1">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        onClick={closeMobile}
                        className="flex items-center gap-2.5 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        <s.icon size={16} className="text-aura-purple" /> {s.title}
                      </Link>
                    ))}
                    <Link href="/services" onClick={closeMobile} className="block py-2 text-sm font-semibold text-aura-cyan">
                      View all services →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={closeMobile}
                className="block py-2 text-gray-300 hover:text-white"
              >
                {l.label}
              </a>
            )
          )}
          <div className="pt-3 flex gap-3">
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
