import type { MetadataRoute } from "next";
import { COMPANY, SERVICES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${COMPANY.domain}`;
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...SERVICES.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/internship`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.5 },
  ];
}
