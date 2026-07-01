import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Wand2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechSolutionsAI from "@/components/TechSolutionsAI";
import ServiceCTA from "@/components/services/ServiceCTA";
import ServiceArt from "@/components/services/ServiceArt";
import { SERVICES, COMPANY } from "@/lib/constants";

const url = `https://${COMPANY.domain}/services`;

export const metadata: Metadata = {
  title: "Services — Software, Web, Mobile, AI & Automation",
  description:
    "Explore what Tech Solutions Pakistan builds: custom software, web platforms, mobile apps, AI agents & chatbots, AI automation, and technical writing. Place a custom order for any project.",
  keywords: [
    "software development Pakistan", "web development", "mobile app development",
    "AI agents", "chatbots", "AI automation", "custom software", "Tech Solutions",
  ],
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Services — Tech Solutions Pakistan",
    description:
      "Custom software, web, mobile, AI agents and automation — engineered for production. Place a custom order for any project.",
  },
};

export default function ServicesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${url}/${s.slug}`,
      name: s.title,
    })),
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="bg-aura-mesh min-h-screen pt-28 pb-24 relative overflow-hidden">
        <div className="orb w-[36rem] h-[36rem] -top-24 left-[calc(50%-18rem)] bg-aura-purple" style={{ filter: "blur(150px)", opacity: 0.12 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="section-tag justify-center">
              <span className="w-8 h-px bg-cyan-500" /> What We Do
              <span className="w-8 h-px bg-cyan-500" />
            </span>
            <h1 className="section-heading text-white">
              Services That <span className="gradient-text">Scale</span>
            </h1>
            <p className="text-gray-400 mt-4 text-lg">
              Full-spectrum engineering — from idea to production. Explore each service, see what we
              deliver, and place a custom order for anything you need built.
            </p>
          </div>

          {/* Service cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="glass-card glass-card-hover !p-0 overflow-hidden flex flex-col group"
              >
                <div className="relative h-40 border-b border-white/10 overflow-hidden">
                  <ServiceArt slug={s.slug} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 w-10 h-10 rounded-xl grid place-items-center bg-[#0e0e22]/80 border border-white/10 backdrop-blur-sm">
                    <s.icon size={18} className="text-aura-cyan" />
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-white mb-2">{s.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-1">{s.tagline}</p>
                  <ul className="space-y-2 mb-5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check size={15} className="text-aura-cyan flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-aura-cyan group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Custom order band */}
          <div className="glass-card mt-10 p-8 sm:p-10 relative overflow-hidden">
            <div className="orb w-72 h-72 -bottom-20 right-0 bg-aura-cyan" style={{ filter: "blur(120px)", opacity: 0.12 }} />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}>
                  <Wand2 size={12} /> Custom Order
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Need something bespoke? <span className="gradient-text">Order any project.</span>
                </h2>
                <p className="text-gray-400">
                  Don’t see an exact fit? Place a custom order describing what you want built — attach
                  requirements, set a budget and deadline, and our team submits a proposal for you to approve.
                </p>
              </div>
              <ServiceCTA />
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-10 inline-flex items-center gap-1.5 w-full justify-center">
            <Sparkles size={12} className="text-aura-purple" /> Prefer to talk it through? Tech Solutions AI is available 24/7.
          </p>
        </div>
      </main>
      <Footer />
      <TechSolutionsAI />
    </>
  );
}
