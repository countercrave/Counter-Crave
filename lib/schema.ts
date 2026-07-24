import type { ContentPage } from "@/types/content";
import { siteConfig } from "@/lib/site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/logo.svg`,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
  };
}

export function breadcrumbSchema(page: ContentPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: `${siteConfig.siteUrl}${page.canonicalPath}`,
      },
    ],
  };
}

export function articleSchema(page: ContentPage) {
  return {
    "@context": "https://schema.org",
    "@type": page.pageType === "Category Hub" ? "CollectionPage" : "Article",
    headline: page.title,
    description: page.description,
    mainEntityOfPage: `${siteConfig.siteUrl}${page.canonicalPath}`,
    author: {
      "@type": "Organization",
      name: page.author || siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.siteUrl}/logo.svg`,
      },
    },
    ...(page.publishedAt ? { datePublished: page.publishedAt } : {}),
    ...(page.updatedAt ? { dateModified: page.updatedAt } : {}),
  };
}
