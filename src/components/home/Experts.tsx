"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getHomepageExperts } from "@/lib/data";
import type { Expert } from "@/lib/types";

export default function Experts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomepageExperts()
      .then(setExperts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="team" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> Our Experts
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            The Team Behind The <span className="gradient-text">Magic</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experts.map((e, i) => (
              <motion.div
                key={e.$id ?? e.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className="glass-card glass-card-hover p-6 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full p-[2px] bg-gradient-to-br from-aura-purple to-aura-cyan mb-4">
                  <div className="w-full h-full rounded-full grid place-items-center bg-[#0c0c1f] text-2xl font-black gradient-text">
                    {e.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">{e.name}</h3>
                <p className="text-xs text-aura-cyan mb-3">{e.role}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {e.skills?.slice(0, 3).map((s) => (
                    <span key={s} className="skill-pill !text-[10px] !px-2 !py-1">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
