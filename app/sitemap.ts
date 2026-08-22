import type { MetadataRoute } from "next";
import { categories } from "./data/site-data";
import { guides } from "./data/guide-data";
import { getSiteUrl } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const updated = new Date("2026-08-22T00:00:00Z");
  return [
    { url: origin, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/guides`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/about`, lastModified: updated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${origin}/disclosure`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
    ...categories.map((category) => ({
      url: `${origin}/categories/${category.slug}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: category.slug === "air-fryers" || category.slug === "blenders" ? 0.85 : 0.65,
    })),
    ...guides.map((guide) => ({
      url: `${origin}/guides/${guide.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
