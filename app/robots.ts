import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: siteConfig.siteUrl,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/content-plan/", "/preview/"],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  };
}
