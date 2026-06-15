"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SERVICES } from "@/lib/constants";

export default function Services() {
  return (
    <section id="services" className="relative py-24 overflow-hidden">
      <div className="orb w-80 h-80 top-10 left-0 bg-aura-blue" style={{ filter: "blur(130px)", opacity: 0.1 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
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
              className="glass-card glass-card-hover p-7"
            >
              <div
                className="w-12 h-12 rounded-xl grid place-items-center mb-5"
                style={{ background: "rgba(124,58,237,0.18)" }}
              >
                <s.icon size={22} className="text-aura-purple" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                {s.description}
              </p>
              <ul className="space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={15} className="text-aura-cyan flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
