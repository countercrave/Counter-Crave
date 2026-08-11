import type { Metadata } from "next";
import Link from "next/link";
import { SiteSearch } from "@/components/SiteSearch";
import { getAllPages } from "@/lib/content";
import { categoryHubs } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Search guides",
  description: "Search CounterCrave kitchen appliance buying guides by product, price range, or category.",
  robots: { index: false, follow: false },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function scorePage(
  query: string,
  page: {
    title: string;
    description: string;
    primaryKeyword: string;
    cluster: string;
    pageType: string;
    secondaryKeywords?: string[];
  },
) {
  const q = query.toLowerCase();
  const haystack = [
    page.title,
    page.description,
    page.primaryKeyword,
    page.cluster,
    page.pageType,
    ...(page.secondaryKeywords || []),
  ]
    .join(" ")
    .toLowerCase();

  if (!q) return 0;
  let score = 0;
  if (page.title.toLowerCase().includes(q)) score += 8;
  if (page.primaryKeyword.toLowerCase().includes(q)) score += 6;
  if (page.cluster.toLowerCase().includes(q)) score += 4;
  if (haystack.includes(q)) score += 2;
  for (const part of q.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(part)) score += 1;
  }
  return score;
}

export default function SearchPage() {
  const query = "";
  const pages = getAllPages({ includeDrafts: false }).filter(
    (page) => !["Trust", "Legal"].includes(page.cluster),
  );

  const results = query
    ? pages
        .map((page) => ({ page, score: scorePage(query, page) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
        .slice(0, 40)
    : [];

  const popular = categoryHubs;

  return (
    <main className="container main-content search-page">
      <header className="article-header">
        <span className="eyebrow">Search</span>
        <h1>Find a CounterCrave buying guide</h1>
        <p className="dek">
          Search by appliance, brand intent, or budget — then open the full
          product shortlist with Amazon links.
        </p>
        <SiteSearch />
      </header>

      {query ? (
        <section className="search-results" aria-live="polite">
          <h2>
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </h2>
          {results.length ? (
            <div className="guide-list">
              {results.map(({ page }) => (
                <article className="guide-row" key={page.pageId}>
                  {page.heroImage ? (
                    <div className="guide-row-image-wrapper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.heroImage}
                        alt={page.title}
                        className="guide-card-image"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div>
                    <span className="eyebrow">
                      {page.cluster} · {page.pageType}
                    </span>
                    <h3>
                      <Link href={`/${page.slug}/`}>{page.title}</Link>
                    </h3>
                    <p>{page.description}</p>
                  </div>
                  <Link className="text-cta" href={`/${page.slug}/`}>
                    Open guide
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p>No matching guides yet. Try a category below.</p>
          )}
        </section>
      ) : (
        <section className="section-block">
          <h2>Browse popular categories</h2>
          <div className="cluster-grid">
            {popular.map((category) => (
              <article className="cluster-card" key={category.slug}>
                {category.heroImage ? (
                  <div className="category-card-image-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.heroImage}
                      alt={category.name}
                      className="category-card-image"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="cluster-card-copy">
                  <h3>
                    <Link href={`/${category.slug}/`}>{category.name}</Link>
                  </h3>
                  <p>{category.description}</p>
                  <Link href={`/${category.slug}/`}>Explore guides</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
