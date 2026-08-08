import Link from "next/link";
import { categoryHubs } from "@/lib/categories";
import { getAllPages } from "@/lib/content";

export default function HomePage() {
  // Only published (non-draft) articles from the master sheet
  const allPublished = getAllPages({ includeDrafts: false }).filter(
    (page) =>
      !page.draft &&
      !["Trust", "Legal"].includes(page.cluster) &&
      ["Commercial Pillar", "Roundup", "Comparison"].includes(page.pageType),
  );

  // Group published articles by category
  const categoryArticles = categoryHubs.map((hub) => {
    const articles = allPublished
      .filter((page) => page.cluster === hub.name)
      .slice(0, 6);
    return { hub, articles };
  }).filter((group) => group.articles.length > 0);

  const featuredGuides = allPublished.slice(0, 6);

  return (
    <main className="homepage-main">
      {/* Hero Section */}
      <section className="hero home-hero">
        <div className="container home-hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">CounterCrave · Verified Appliance Reviews</span>
            <h1>Smart buying guides for countertop kitchen appliances.</h1>
            <p>
              Clean, decision-first comparisons for air fryers, blenders, toaster ovens,
              coffee grinders and more — with clear trade-offs, specs, and Amazon links.
            </p>
            <div className="button-row">
              <a className="button button-primary" href="#categories">
                Explore categories
              </a>
              <Link className="button button-secondary" href="/best-air-fryers/">
                Best air fryers 2026
              </Link>
            </div>
          </div>

          <div className="hero-spotlight-card" aria-label="Editor's Top Pick Spotlight">
            <div className="spotlight-header">
              <span className="spotlight-tag">★ #1 Editor&apos;s Pick 2026</span>
              <span className="spotlight-score">9.2 / 10 Rating</span>
            </div>
            <div className="spotlight-body">
              <div className="spotlight-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg"
                  alt="COSORI TurboBlaze 6-Qt Air Fryer"
                  width={110}
                  height={110}
                />
              </div>
              <div className="spotlight-info">
                <span className="pick-label pick-label-best-overall">Best Overall Air Fryer</span>
                <h3>COSORI TurboBlaze 6-Qt</h3>
                <p>Powerful 3600 RPM TurboBlaze fan speed with PFAS-free ceramic nonstick basket.</p>
                <div className="spotlight-specs">
                  <span>6 QT Capacity</span>
                  <span>1725W Power</span>
                  <span>Ceramic Nonstick</span>
                </div>
              </div>
            </div>
            <div className="spotlight-footer">
              <Link href="/ninja-vs-cosori-air-fryer/" className="spotlight-cta">
                Read full Ninja vs Cosori review →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Hubs Grid */}
      <section id="categories" className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Browse by category</span>
            <h2>All kitchen appliance hubs</h2>
          </div>
        </div>

        <div className="cluster-grid">
          {categoryHubs.map((category) => (
            <article className="cluster-card" key={category.slug}>
              <div className="category-card-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.heroImage}
                  alt={category.name}
                  className="category-card-image"
                  width={400}
                  height={225}
                  loading="lazy"
                />
              </div>
              <div className="cluster-card-copy">
                <h3>
                  <Link href={`/${category.slug}/`}>{category.name}</Link>
                </h3>
                <p>{category.description}</p>
                <Link className="text-cta" href={`/${category.slug}/`}>
                  Explore {category.short} guides →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Top Picks Grid */}
      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Top Published Reviews</span>
            <h2>Popular buying guides</h2>
          </div>
        </div>

        <div className="homepage-guides-grid">
          {featuredGuides.map((page) => {
            const fallbackHero =
              page.heroImage ||
              categoryHubs.find((c) => c.name === page.cluster)?.heroImage ||
              "/images/heroes/air-fryers.jpg";

            return (
              <article className="homepage-guide-card" key={page.pageId}>
                <div className="guide-card-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fallbackHero}
                    alt={page.title}
                    className="guide-card-image"
                    width={400}
                    height={225}
                    loading="lazy"
                  />
                  <span className="guide-category-badge">{page.cluster}</span>
                </div>
                <div className="guide-card-body">
                  <span className="eyebrow">{page.pageType}</span>
                  <h3>
                    <Link href={`/${page.slug}/`}>{page.title}</Link>
                  </h3>
                  <p>{page.description}</p>
                  <Link className="text-cta" href={`/${page.slug}/`}>
                    Read full review →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Category-wise Published Articles Grids */}
      {categoryArticles.map(({ hub, articles }) => (
        <section key={hub.slug} className="container section-block category-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{hub.name} Guides</span>
              <h2>Best {hub.name} reviews</h2>
            </div>
            <Link className="text-cta" href={`/${hub.slug}/`}>
              View all {hub.name} →
            </Link>
          </div>

          <div className="homepage-guides-grid">
            {articles.map((page) => {
              const heroImg =
                page.heroImage || hub.heroImage || "/images/heroes/air-fryers.jpg";

              return (
                <article className="homepage-guide-card" key={page.pageId}>
                  <div className="guide-card-image-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImg}
                      alt={page.title}
                      className="guide-card-image"
                      width={400}
                      height={225}
                      loading="lazy"
                    />
                    <span className="guide-category-badge">{page.pageType}</span>
                  </div>
                  <div className="guide-card-body">
                    <h3>
                      <Link href={`/${page.slug}/`}>{page.title}</Link>
                    </h3>
                    <p>{page.description}</p>
                    <Link className="text-cta" href={`/${page.slug}/`}>
                      Read review →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
