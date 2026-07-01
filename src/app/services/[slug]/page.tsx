import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, CircleDot } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechSolutionsAI from "@/components/TechSolutionsAI";
import ServiceCTA from "@/components/services/ServiceCTA";
import ServiceArt from "@/components/services/ServiceArt";
import { SERVICES, getService, COMPANY } from "@/lib/constants";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: "Service not found" };
  const url = `https://${COMPANY.domain}/services/${s.slug}`;
  return {
    title: `${s.title} — Tech Solutions Pakistan`,
    description: s.overview,
    keywords: [s.title, ...s.tech, ...s.features, "Tech Solutions", "Pakistan"],
    alternates: { canonical: url },
    openGraph: { url, title: `${s.title} — Tech Solutions Pakistan`, description: s.tagline },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const url = `https://${COMPANY.domain}/services/${s.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.overview,
    serviceType: s.title,
    provider: { "@type": "Organization", name: COMPANY.name, url: `https://${COMPANY.domain}` },
    areaServed: "Worldwide",
    url,
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="bg-aura-mesh min-h-screen pt-28 pb-24 relative overflow-hidden">
        <div className="orb w-[34rem] h-[34rem] -top-24 left-[calc(50%-17rem)] bg-aura-purple" style={{ filter: "blur(150px)", opacity: 0.12 }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6">
            <ArrowLeft size={16} /> All services
          </Link>

          {/* Hero — copy + visual */}
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
            <div>
              <span className="section-tag">
                <span className="w-8 h-px bg-cyan-500" /> Service
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-[1.08]">{s.title}</h1>
              <p className="text-gray-400 mt-4 text-lg leading-relaxed">{s.tagline}</p>
              <div className="mt-7">
                <ServiceCTA service={s.title} />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[400/260]">
                <ServiceArt slug={s.slug} className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Outcomes */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {s.outcomes.map((o) => (
              <div key={o.label} className="glass-card !p-4 text-center">
                <div className="text-xl sm:text-2xl font-black gradient-text">{o.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-widest">{o.label}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="glass-card p-7 mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{s.overview}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Deliverables */}
            <div className="glass-card p-7">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">What we deliver</h2>
              <ul className="space-y-3">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check size={16} className="text-aura-cyan mt-0.5 shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Process */}
            <div className="glass-card p-7">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">How we work</h2>
              <ol className="space-y-4">
                {s.process.map((p, i) => (
                  <li key={p.step} className="flex gap-3">
                    <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-bold text-white bg-gradient-to-br from-aura-purple to-aura-cyan">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{p.step}</p>
                      <p className="text-sm text-gray-400">{p.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tech */}
          <div className="glass-card p-7 mb-8">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Tools & tech</h2>
            <div className="flex flex-wrap gap-2">
              {s.tech.map((t) => (
                <span key={t} className="skill-pill inline-flex items-center gap-1.5">
                  <CircleDot size={12} className="text-aura-cyan" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-black text-white mb-2">
              Ready to build your <span className="gradient-text">{s.title.toLowerCase()}</span>?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Place a custom order and our team submits a proposal for you to approve — or ask our AI anything first.
            </p>
            <div className="flex justify-center">
              <ServiceCTA service={s.title} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <TechSolutionsAI />
    </>
  );
}
