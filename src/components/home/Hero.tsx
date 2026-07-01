"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Star } from "lucide-react";
import { ROTATING_SERVICES, STATS } from "@/lib/constants";
import HeroMockup from "./HeroMockup";

export default function Hero({ onStartProject }: { onStartProject: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % ROTATING_SERVICES.length),
      2400
    );
    return () => clearInterval(t);
  }, []);

  // Opens the Tech Solutions AI widget — the only way to reach the team.
  const openAI = () => window.dispatchEvent(new Event("open-ts-ai"));

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-aura-mesh pt-28 pb-16"
    >
      <div className="orb w-96 h-96 top-1/4 -left-10 bg-aura-purple" style={{ filter: "blur(90px)", opacity: 0.16 }} />
      <div className="orb w-80 h-80 bottom-0 right-0 bg-aura-cyan" style={{ filter: "blur(80px)", opacity: 0.12 }} />

      {/* Moving background particles */}
      <div className="ts-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={`ts-particle ts-particle-${(i % 6) + 1}`} />
        ))}
      </div>

      {/* Soft moving glow beneath the hero */}
      <div className="ts-hero-gradient" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
          >
            <Sparkles size={12} /> Premium Digital Agency
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-[4.2rem] font-black leading-[1.05] mb-4"
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
            className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Enterprise software, web & mobile apps, big data, and AI automation —
            engineered for production from day one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6"
          >
            <button onClick={onStartProject} className="btn-primary">
              <ArrowRight size={18} /> Start Project
            </button>
            <button onClick={openAI} className="btn-secondary">
              <Calendar size={18} /> Book Consultation
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-400"
          >
            <div className="flex">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a1a] -ml-2 first:ml-0 grid place-items-center text-[10px] font-bold text-white"
                  style={{ background: ["#7c3aed", "#2563eb", "#06b6d4", "#a78bfa"][i] }}>
                  {["A", "Z", "B", "H"][i]}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} className="text-aura-gold fill-aura-gold" />)}
            </span>
            <span><span className="text-white font-semibold">400+ projects</span> delivered · 98% satisfaction</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-xl mx-auto lg:mx-0"
          >
            {STATS.map((s) => (
              <div key={s.label} className="stat-card glass-card-hover !p-4">
                <div className="text-xl sm:text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: dashboard mockup */}
        <div className="hidden lg:block">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
