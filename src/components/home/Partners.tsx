import { PARTNERS } from "@/lib/constants";

export default function Partners() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-7">
          Powering teams with the world&apos;s best technology
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-scroll-x marquee-track gap-5">
            {loop.map((p, i) => (
              <span
                key={i}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] whitespace-nowrap transition-all duration-300 hover:border-aura-purple/40 hover:bg-white/[0.06]"
              >
                <span className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-aura-cyan transition-colors" />
                <span className="text-lg font-bold text-gray-500 group-hover:text-white transition-colors">
                  {p}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
