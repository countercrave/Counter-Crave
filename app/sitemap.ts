import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllPages()
    .filter((page) => !page.draft && !page.noindex)
    .map((page) => ({
      url: `${siteConfig.siteUrl}${page.canonicalPath}`,
      lastModified: page.updatedAt || page.publishedAt || undefined,
      changeFrequency: "monthly" as const,
      priority: page.pageType === "Static" ? 0.5 : 0.7,
    }));

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: "2026-07-24",
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pages,
  ];
}
