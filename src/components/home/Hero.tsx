"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Code2, Globe, Bot, Workflow } from "lucide-react";
import { ROTATING_SERVICES, STATS } from "@/lib/constants";

const floatingIcons = [
  { Icon: Code2, x: "8%", y: "20%", delay: 0 },
  { Icon: Globe, x: "85%", y: "30%", delay: 1 },
  { Icon: Bot, x: "12%", y: "70%", delay: 2 },
  { Icon: Workflow, x: "88%", y: "68%", delay: 1.5 },
];

export default function Hero({ onStartProject }: { onStartProject: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % ROTATING_SERVICES.length),
      2400
    );
    return () => clearInterval(t);
  }, []);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-aura-mesh pt-28 pb-16"
    >
      <div className="orb w-96 h-96 top-1/4 left-1/4 bg-aura-purple" style={{ filter: "blur(80px)", opacity: 0.14 }} />
      <div className="orb w-80 h-80 bottom-1/4 right-1/4 bg-aura-cyan" style={{ filter: "blur(70px)", opacity: 0.12 }} />

      {/* Floating service icons — no backdrop-blur (they animate forever). */}
      {floatingIcons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:grid place-items-center w-14 h-14 rounded-2xl border border-white/10"
          style={{ left: x, top: y, background: "rgba(20,20,40,0.5)", willChange: "transform" }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon size={24} className="text-aura-cyan" />
        </motion.div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa",
          }}
        >
          <Sparkles size={12} /> Premium Digital Agency <Sparkles size={12} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4"
        >
          <span className="text-white">We Build </span>
          <br className="hidden sm:block" />
          <span className="h-[1.2em] inline-block">
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
                className="gradient-text inline-block"
              >
                {ROTATING_SERVICES[idx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-9 leading-relaxed"
        >
          Enterprise software, web & mobile apps, big data, and AI automation —
          engineered for production from day one. 400+ projects delivered across
          12+ industries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          <button onClick={onStartProject} className="btn-primary">
            <ArrowRight size={18} /> Start Project
          </button>
          <button onClick={() => scrollTo("#contact")} className="btn-secondary">
            <Calendar size={18} /> Book Consultation
          </button>
        </motion.div>

        {/* Live statistics cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {STATS.map((s) => (
            <div key={s.label} className="stat-card glass-card-hover">
              <div className="text-2xl sm:text-3xl font-black gradient-text">
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
