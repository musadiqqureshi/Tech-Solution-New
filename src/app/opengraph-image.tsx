import { ImageResponse } from "next/og";

export const alt = "Tech Solutions Pakistan — Premium Digital Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a1a",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(6,182,212,0.30), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg,#7c3aed,#2563eb 55%,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            T
          </div>
          <div style={{ fontSize: 30, color: "#a5b4fc", fontWeight: 600 }}>tech-solutions.site</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>
          Tech Solutions Pakistan
        </div>
        <div style={{ fontSize: 34, color: "#cbd5e1", marginTop: 24, maxWidth: 900 }}>
          Enterprise software, web & mobile, AI automation — and a SaaS platform to run your IT company.
        </div>
      </div>
    ),
    { ...size }
  );
}
