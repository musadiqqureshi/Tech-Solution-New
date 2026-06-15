"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PORTFOLIO } from "@/lib/constants";

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative py-24 overflow-hidden bg-[#080816]">
      <div className="orb w-96 h-96 -top-20 right-1/4 bg-aura-cyan" style={{ filter: "blur(140px)", opacity: 0.08 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> Our Work
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            Featured <span className="gradient-text">Case Studies</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Eight production systems delivering real business outcomes at scale.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PORTFOLIO.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group glass-card glass-card-hover p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-aura-cyan">
                  {p.category}
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-gray-600 group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="skill-pill !text-[10px] !px-2 !py-1">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
