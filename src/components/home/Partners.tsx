import { PARTNERS } from "@/lib/constants";

export default function Partners() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <section className="py-12 border-y border-white/5 bg-[#0a0a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-widest text-gray-600 mb-8">
          Trusted technology partners
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-scroll-x marquee-track gap-14">
            {loop.map((p, i) => (
              <span
                key={i}
                className="text-xl sm:text-2xl font-bold text-gray-500 hover:text-white transition-colors whitespace-nowrap"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
