import Link from "next/link";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { COMPANY, SERVICES, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#070712] pt-16 pb-8 overflow-hidden">
      <div className="orb w-96 h-96 -bottom-40 left-1/4 bg-aura-purple" style={{ filter: "blur(140px)", opacity: 0.08 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-black text-lg mb-4">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
                <Sparkles size={18} className="text-white" />
              </span>
              <span className="text-white">
                Tech<span className="gradient-text">Solutions</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {COMPANY.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.title}>
                  <a href="#services" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-aura-purple" /> {COMPANY.location}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-aura-cyan" /> {COMPANY.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-aura-gold" /> {COMPANY.phone}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with Next.js & Supabase · Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
