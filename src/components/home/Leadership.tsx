"use client";

import { motion } from "framer-motion";
import { Linkedin, Mail, Quote } from "lucide-react";
import { CEO } from "@/lib/constants";

export default function Leadership() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#080816]">
      <div className="orb w-96 h-96 -bottom-20 left-1/4 bg-aura-blue" style={{ filter: "blur(140px)", opacity: 0.1 }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> Leadership
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            Meet The <span className="gradient-text">Founder</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 sm:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-center"
        >
          {/* Avatar */}
          <div className="relative mx-auto">
            <div
              className="absolute -inset-4 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
              <div className="w-full h-full rounded-full grid place-items-center bg-[#0c0c1f] text-5xl font-black gradient-text">
                MQ
              </div>
            </div>
          </div>

          <div>
            <Quote size={28} className="text-aura-purple/50 mb-3" />
            <h3 className="text-2xl font-black text-white">{CEO.name}</h3>
            <p className="text-aura-cyan font-semibold mb-1">{CEO.title}</p>
            <p className="text-sm text-gray-500 mb-4">{CEO.role}</p>
            <p className="text-gray-400 leading-relaxed mb-6">{CEO.bio}</p>

            <div className="flex flex-wrap items-center gap-6">
              {CEO.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black gradient-text">{s.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 ml-auto">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl grid place-items-center glass-card glass-card-hover"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} className="text-aura-cyan" />
                </a>
                <a
                  href="/register"
                  className="w-10 h-10 rounded-xl grid place-items-center glass-card glass-card-hover"
                  aria-label="Email"
                >
                  <Mail size={18} className="text-aura-purple" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
