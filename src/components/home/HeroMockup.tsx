"use client";

import { motion } from "framer-motion";

/** Lightweight animated "dashboard" mockup for the hero (pure SVG, no assets). */
export default function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative w-full max-w-xl mx-auto"
      style={{ perspective: 1000 }}
    >
      <div className="glass-card p-3 shadow-2xl" style={{ background: "rgba(14,14,34,0.85)" }}>
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-2 py-2">
          <span className="w-3 h-3 rounded-full" style={{ background: "#f87171" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#34d399" }} />
          <span className="ml-3 text-[10px] text-gray-500">app.tech-solutions.site</span>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "#0b0b1e" }}>
          <svg viewBox="0 0 560 360" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hm-bar" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="hm-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            {/* sidebar */}
            <rect x="0" y="0" width="120" height="360" fill="#0e0e22" />
            <rect x="20" y="22" width="80" height="10" rx="5" fill="#7c3aed" opacity="0.8" />
            {[70, 100, 130, 160, 190].map((y, i) => (
              <rect key={y} x="20" y={y} width={i === 0 ? 80 : 70} height="9" rx="4.5" fill="#ffffff" opacity={i === 0 ? 0.25 : 0.1} />
            ))}

            {/* topbar */}
            <rect x="120" y="0" width="440" height="44" fill="#0c0c1f" />
            <rect x="144" y="16" width="120" height="12" rx="6" fill="#ffffff" opacity="0.18" />
            <circle cx="528" cy="22" r="12" fill="#7c3aed" opacity="0.5" />

            {/* stat tiles */}
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={144 + i * 138} y="64" width="124" height="64" rx="10" fill="#13132b" />
                <rect x={158 + i * 138} y="78" width="46" height="8" rx="4" fill="#ffffff" opacity="0.2" />
                <rect x={158 + i * 138} y="96" width="70" height="16" rx="5" fill="url(#hm-line)" opacity="0.9" />
              </g>
            ))}

            {/* bar chart */}
            <rect x="144" y="148" width="250" height="188" rx="12" fill="#13132b" />
            {[40, 70, 55, 95, 80, 120, 100].map((h, i) => (
              <motion.rect
                key={i}
                x={168 + i * 30}
                width="16"
                rx="4"
                fill="url(#hm-bar)"
                initial={{ height: 0, y: 312 }}
                animate={{ height: h, y: 312 - h }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: "easeOut" }}
              />
            ))}

            {/* donut */}
            <rect x="410" y="148" width="150" height="188" rx="12" fill="#13132b" />
            <circle cx="485" cy="232" r="46" fill="none" stroke="#26264a" strokeWidth="14" />
            <motion.circle
              cx="485" cy="232" r="46" fill="none" stroke="url(#hm-bar)" strokeWidth="14"
              strokeLinecap="round" strokeDasharray="289" transform="rotate(-90 485 232)"
              initial={{ strokeDashoffset: 289 }}
              animate={{ strokeDashoffset: 80 }}
              transition={{ duration: 1, delay: 0.7 }}
            />
            <text x="485" y="238" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">72%</text>
          </svg>
        </div>
      </div>

      {/* floating badge */}
      <motion.div
        className="absolute -left-4 bottom-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10"
        style={{ background: "rgba(20,20,40,0.9)" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs text-white font-semibold">Project delivered</span>
      </motion.div>
    </motion.div>
  );
}
