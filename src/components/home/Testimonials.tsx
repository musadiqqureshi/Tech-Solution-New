"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { listApprovedReviews } from "@/lib/reviews";

type Item = { name: string; role: string; text: string; rating: number };

function Card({ t }: { t: Item }) {
  return (
    <div className="glass-card p-6 w-[320px] flex-shrink-0">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-aura-gold text-aura-gold" />
        ))}
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-5">“{t.text}”</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full grid place-items-center font-bold text-white bg-gradient-to-br from-aura-purple to-aura-cyan">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.name}</p>
          <p className="text-xs text-gray-500">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [items, setItems] = useState<Item[]>(TESTIMONIALS as Item[]);

  useEffect(() => {
    listApprovedReviews()
      .then((reviews) => {
        if (!reviews.length) return;
        const mapped: Item[] = reviews.map((r) => ({
          name: r.clientName,
          role: "Verified Client",
          text: r.comment || "Great experience working with the team!",
          rating: r.rating,
        }));
        setItems([...mapped, ...(TESTIMONIALS as Item[])]);
      })
      .catch(() => {});
  }, []);

  const loop = [...items, ...items];
  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="orb w-80 h-80 top-0 left-1/3 bg-aura-purple" style={{ filter: "blur(140px)", opacity: 0.1 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-14">
        <div className="text-center">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> Testimonials
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            Loved by <span className="gradient-text">Clients Worldwide</span>
          </h2>
        </div>
      </div>

      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max gap-6 animate-scroll-x marquee-track px-3">
          {loop.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
