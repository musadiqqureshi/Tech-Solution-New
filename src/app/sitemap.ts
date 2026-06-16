import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${COMPANY.domain}`;
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/register`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.5 },
  ];
}
