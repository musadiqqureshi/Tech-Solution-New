"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Wand2 } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import ServiceArt from "@/components/services/ServiceArt";

export default function Services() {
  return (
    <section id="services" className="relative pt-16 pb-24 overflow-hidden">
      <div className="orb w-[36rem] h-[36rem] -top-24 left-[calc(50%-18rem)] bg-aura-purple" style={{ filter: "blur(150px)", opacity: 0.12 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> What We Do
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            Services That <span className="gradient-text">Scale</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            From idea to production — a full-spectrum engineering team behind
            every line of code.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
            >
              <Link href={`/services/${s.slug}`} className="glass-card glass-card-hover !p-0 overflow-hidden flex flex-col h-full group">
                {/* Visual banner */}
                <div className="relative h-40 border-b border-white/10 overflow-hidden">
                  <ServiceArt slug={s.slug} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 w-10 h-10 rounded-xl grid place-items-center bg-[#0e0e22]/80 border border-white/10 backdrop-blur-sm">
                    <s.icon size={18} className="text-aura-cyan" />
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-1">
                    {s.description}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check size={15} className="text-aura-cyan flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-aura-cyan group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all + custom order */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          <Link href="/services" className="btn-secondary">
            Explore all services <ArrowRight size={17} />
          </Link>
          <Link href="/app/client/orders/new" className="btn-primary">
            <Wand2 size={17} /> Place a custom order
          </Link>
        </div>
      </div>
    </section>
  );
}
