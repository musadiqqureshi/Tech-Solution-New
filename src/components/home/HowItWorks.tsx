"use client";

import { motion } from "framer-motion";
import { ClipboardList, Code2, Rocket } from "lucide-react";

const STEPS = [
  { icon: ClipboardList, title: "Brief", text: "Tell us your goals, requirements, and timeline — via the form, chat, or a quick consultation. We scope it together." },
  { icon: Code2, title: "Build", text: "Our experts engineer your solution with clear milestones. Track progress, share files, and review as it comes together." },
  { icon: Rocket, title: "Deliver", text: "We ship production-ready work, hand over deliverables, and stay on for follow-ups, revisions, and support." },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 section-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="section-tag justify-center"><span className="w-8 h-px bg-cyan-500" /> How It Works <span className="w-8 h-px bg-cyan-500" /></div>
          <h2 className="section-heading text-white">From idea to <span className="gradient-text">launch</span> in 3 steps</h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">A simple, transparent process — you always know what&apos;s happening and what&apos;s next.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-gradient-to-r from-aura-purple/40 via-aura-cyan/40 to-aura-purple/40" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card glass-card-hover p-7 text-center relative"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-5 bg-gradient-to-br from-aura-purple to-aura-cyan">
                <s.icon size={26} className="text-white" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0a0a1a] border border-white/15 grid place-items-center text-xs font-bold text-aura-cyan">{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
