"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "purple",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  color?: "purple" | "blue" | "cyan" | "gold";
  index?: number;
}) {
  const bg = {
    purple: "rgba(124,58,237,0.18)",
    blue: "rgba(37,99,235,0.18)",
    cyan: "rgba(6,182,212,0.18)",
    gold: "rgba(245,158,11,0.18)",
  }[color];
  const fg = {
    purple: "#a78bfa",
    blue: "#60a5fa",
    cyan: "#22d3ee",
    gold: "#fbbf24",
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="glass-card glass-card-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: bg }}>
          <Icon size={20} style={{ color: fg }} />
        </div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
      {hint && <div className="text-xs text-gray-600 mt-2">{hint}</div>}
    </motion.div>
  );
}

/** Placeholder card used by sub-pages that build out in later Stage 2 work. */
export function ComingSoon({
  title,
  note,
  icon: Icon,
}: {
  title: string;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <div className="glass-card p-10 text-center">
      <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4 bg-gradient-to-br from-aura-purple/30 to-aura-cyan/20">
        <Icon size={26} className="text-aura-cyan" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-400 max-w-md mx-auto">{note}</p>
    </div>
  );
}
