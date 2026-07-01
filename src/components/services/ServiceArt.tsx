/**
 * Per-service illustrated artwork (inline SVG, no external images).
 * Used as a visual banner on service cards and as the hero image on detail pages.
 * Each scene is themed to the service with the brand gradient (purple→blue→cyan).
 */

const PURPLE = "#7c3aed";
const BLUE = "#2563eb";
const CYAN = "#06b6d4";

function Frame({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 260" className="w-full h-full block" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <linearGradient id={`bg-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14142e" />
          <stop offset="1" stopColor="#0a0a1a" />
        </linearGradient>
        <linearGradient id={`ac-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PURPLE} />
          <stop offset="0.55" stopColor={BLUE} />
          <stop offset="1" stopColor={CYAN} />
        </linearGradient>
        <radialGradient id={`gl-${slug}`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={PURPLE} stopOpacity="0.55" />
          <stop offset="1" stopColor={PURPLE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#bg-${slug})`} />
      <circle cx="300" cy="70" r="150" fill={`url(#gl-${slug})`} />
      <g stroke="#ffffff" strokeOpacity="0.05">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="260" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
        ))}
      </g>
      {children}
    </svg>
  );
}

function Software() {
  const s = "software-development";
  return (
    <Frame slug={s}>
      <rect x="70" y="60" width="260" height="150" rx="12" fill="#0e0e22" stroke="#ffffff" strokeOpacity="0.12" />
      <rect x="70" y="60" width="260" height="26" rx="12" fill="#ffffff" fillOpacity="0.04" />
      <circle cx="86" cy="73" r="4" fill="#ff5f57" />
      <circle cx="100" cy="73" r="4" fill="#febc2e" />
      <circle cx="114" cy="73" r="4" fill="#28c840" />
      <g fontFamily="monospace" fontSize="12" fill={CYAN}>
        <text x="88" y="112">&lt;/&gt;</text>
      </g>
      <g fill="#ffffff" fillOpacity="0.85">
        <rect x="120" y="104" width="90" height="7" rx="3.5" fill={`url(#ac-${s})`} />
        <rect x="88" y="124" width="150" height="6" rx="3" fillOpacity="0.25" />
        <rect x="108" y="140" width="120" height="6" rx="3" fillOpacity="0.18" />
        <rect x="108" y="156" width="90" height="6" rx="3" fill={CYAN} fillOpacity="0.6" />
        <rect x="88" y="172" width="70" height="6" rx="3" fillOpacity="0.18" />
      </g>
      <rect x="250" y="120" width="62" height="62" rx="10" fill={`url(#ac-${s})`} opacity="0.9" />
      <text x="281" y="158" fontFamily="monospace" fontSize="26" fill="#fff" textAnchor="middle">{"{ }"}</text>
    </Frame>
  );
}

function Web() {
  const s = "web-development";
  return (
    <Frame slug={s}>
      <rect x="60" y="55" width="280" height="160" rx="12" fill="#0e0e22" stroke="#ffffff" strokeOpacity="0.12" />
      <rect x="60" y="55" width="280" height="28" rx="12" fill="#ffffff" fillOpacity="0.05" />
      <rect x="120" y="64" width="180" height="10" rx="5" fill="#ffffff" fillOpacity="0.08" />
      <circle cx="78" cy="69" r="4" fill={CYAN} />
      <rect x="76" y="98" width="120" height="46" rx="8" fill={`url(#ac-${s})`} opacity="0.9" />
      <rect x="208" y="98" width="118" height="46" rx="8" fill="#ffffff" fillOpacity="0.06" />
      <rect x="76" y="156" width="80" height="10" rx="5" fill="#ffffff" fillOpacity="0.25" />
      <rect x="76" y="174" width="140" height="8" rx="4" fill="#ffffff" fillOpacity="0.15" />
      <rect x="76" y="190" width="110" height="8" rx="4" fill="#ffffff" fillOpacity="0.12" />
      <rect x="250" y="160" width="76" height="38" rx="8" fill={CYAN} fillOpacity="0.25" stroke={CYAN} strokeOpacity="0.5" />
      {/* cursor */}
      <path d="M300 150 l0 30 l8 -8 l6 12 l6 -3 l-6 -12 l11 0 z" fill="#fff" stroke="#0a0a1a" strokeWidth="1.5" />
    </Frame>
  );
}

function Mobile() {
  const s = "mobile-applications";
  return (
    <Frame slug={s}>
      <rect x="150" y="45" width="100" height="185" rx="18" fill="#0e0e22" stroke="#ffffff" strokeOpacity="0.14" />
      <rect x="150" y="45" width="100" height="185" rx="18" fill={`url(#ac-${s})`} opacity="0.12" />
      <rect x="182" y="53" width="36" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
      <g>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={162 + (i % 2) * 40} y={72 + Math.floor(i / 2) * 40} width="32" height="32" rx="8"
            fill={`url(#ac-${s})`} opacity={0.85 - i * 0.12} />
        ))}
      </g>
      <rect x="162" y="156" width="76" height="10" rx="5" fill="#ffffff" fillOpacity="0.25" />
      <rect x="162" y="174" width="56" height="8" rx="4" fill="#ffffff" fillOpacity="0.15" />
      <rect x="180" y="206" width="40" height="6" rx="3" fill="#ffffff" fillOpacity="0.3" />
      {/* notification */}
      <g>
        <rect x="250" y="70" width="86" height="40" rx="10" fill="#0e0e22" stroke={CYAN} strokeOpacity="0.5" />
        <circle cx="268" cy="90" r="8" fill={`url(#ac-${s})`} />
        <rect x="284" y="82" width="42" height="6" rx="3" fill="#ffffff" fillOpacity="0.35" />
        <rect x="284" y="94" width="30" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.2" />
      </g>
    </Frame>
  );
}

function Writing() {
  const s = "content-research-writing";
  return (
    <Frame slug={s}>
      <rect x="96" y="50" width="150" height="180" rx="10" fill="#ffffff" fillOpacity="0.95" />
      <rect x="96" y="50" width="150" height="180" rx="10" fill="none" stroke="#ffffff" strokeOpacity="0.15" />
      <rect x="116" y="72" width="80" height="10" rx="5" fill={`url(#ac-${s})`} />
      <g fill="#0a0a1a" fillOpacity="0.3">
        <rect x="116" y="98" width="110" height="6" rx="3" />
        <rect x="116" y="112" width="110" height="6" rx="3" />
        <rect x="116" y="126" width="86" height="6" rx="3" />
        <rect x="116" y="150" width="110" height="6" rx="3" />
        <rect x="116" y="164" width="96" height="6" rx="3" />
        <rect x="116" y="178" width="70" height="6" rx="3" />
      </g>
      {/* pen */}
      <g transform="rotate(38 262 150)">
        <rect x="250" y="70" width="18" height="120" rx="4" fill={`url(#ac-${s})`} />
        <path d="M250 190 l9 22 l9 -22 z" fill="#ffffff" />
        <rect x="250" y="70" width="18" height="14" rx="4" fill="#0e0e22" />
      </g>
    </Frame>
  );
}

function Automation() {
  const s = "ai-automation";
  const node = (x: number, y: number, r = 18) => (
    <>
      <circle cx={x} cy={y} r={r} fill="#0e0e22" stroke={`url(#ac-${s})`} strokeWidth="2.5" />
      <circle cx={x} cy={y} r={r - 8} fill={`url(#ac-${s})`} opacity="0.9" />
    </>
  );
  return (
    <Frame slug={s}>
      <g stroke={CYAN} strokeOpacity="0.6" strokeWidth="2" fill="none">
        <path d="M110 90 C 170 90 170 170 230 170" />
        <path d="M110 90 C 190 90 210 90 290 90" />
        <path d="M230 170 C 270 170 270 170 290 90" />
      </g>
      {/* arrow heads */}
      <g fill={CYAN}>
        <circle cx="170" cy="130" r="3" />
        <circle cx="260" cy="130" r="3" />
      </g>
      {node(110, 90)}
      {node(230, 170)}
      {node(290, 90, 22)}
      {/* gear on the big node */}
      <g transform="translate(290 90)" fill="#fff">
        <circle r="6" fill="#0e0e22" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="-2" y="-13" width="4" height="6" transform={`rotate(${i * 45})`} />
        ))}
      </g>
    </Frame>
  );
}

function Agents() {
  const s = "ai-agents-chatbots";
  return (
    <Frame slug={s}>
      {/* robot head */}
      <rect x="96" y="86" width="96" height="80" rx="18" fill="#0e0e22" stroke={`url(#ac-${s})`} strokeWidth="2.5" />
      <line x1="144" y1="70" x2="144" y2="86" stroke={CYAN} strokeWidth="3" />
      <circle cx="144" cy="66" r="6" fill={`url(#ac-${s})`} />
      <circle cx="124" cy="120" r="9" fill={CYAN} />
      <circle cx="164" cy="120" r="9" fill={CYAN} />
      <rect x="122" y="142" width="44" height="8" rx="4" fill="#ffffff" fillOpacity="0.3" />
      {/* chat bubbles */}
      <g>
        <rect x="212" y="80" width="104" height="44" rx="14" fill={`url(#ac-${s})`} />
        <path d="M228 124 l0 16 l16 -16 z" fill={CYAN} />
        <rect x="228" y="96" width="72" height="6" rx="3" fill="#fff" fillOpacity="0.75" />
        <rect x="228" y="108" width="52" height="6" rx="3" fill="#fff" fillOpacity="0.5" />
      </g>
      <g>
        <rect x="224" y="150" width="92" height="40" rx="14" fill="#0e0e22" stroke="#ffffff" strokeOpacity="0.15" />
        <rect x="238" y="164" width="64" height="6" rx="3" fill="#fff" fillOpacity="0.35" />
        <rect x="238" y="176" width="40" height="6" rx="3" fill="#fff" fillOpacity="0.2" />
      </g>
      {/* sparkle */}
      <path d="M330 150 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4 l12 -4 z" fill={CYAN} />
    </Frame>
  );
}

const ART: Record<string, () => React.ReactElement> = {
  "software-development": Software,
  "web-development": Web,
  "mobile-applications": Mobile,
  "content-research-writing": Writing,
  "ai-automation": Automation,
  "ai-agents-chatbots": Agents,
};

export default function ServiceArt({ slug, className = "" }: { slug: string; className?: string }) {
  const Art = ART[slug] ?? Software;
  return (
    <div className={className}>
      <Art />
    </div>
  );
}
