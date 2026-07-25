import { getAllPages } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function GET() {
  if (!siteConfig.allowIndexing) {
    return new Response(
      `# ${siteConfig.name}\n\nSitewide noindex is enabled. Content map withheld until indexing is turned on.\n`,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-robots-tag": "noindex, nofollow",
          "cache-control": "public, max-age=300",
        },
      },
    );
  }

  const published = getAllPages().filter(
    (page) => !page.draft && !page.noindex,
  );

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## Editorial standards",
    `- ${siteConfig.siteUrl}/how-we-test/`,
    `- ${siteConfig.siteUrl}/editorial-policy/`,
    `- ${siteConfig.siteUrl}/affiliate-disclosure/`,
    "",
    "## Published pages",
    ...published.map(
      (page) =>
        `- [${page.title}](${siteConfig.siteUrl}${page.canonicalPath}): ${page.description}`,
    ),
    "",
    "This optional file is a curated map. Standard crawlability, clean HTML, original content and normal SEO remain the primary implementation.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
