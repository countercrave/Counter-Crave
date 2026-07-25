import Link from "next/link";
import { categoryHubs } from "@/lib/categories";
import { getAllPages } from "@/lib/content";

export default function HomePage() {
  const latestGuides = getAllPages({ includeDrafts: false })
    .filter(
      (page) =>
        !["Trust", "Legal"].includes(page.cluster) &&
        ["Commercial Pillar", "Roundup", "Comparison", "Buying Guide"].includes(
          page.pageType,
        ),
    )
    .slice(0, 12);

  return (
    <main>
      <section className="hero home-hero">
        <div className="container home-hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">CounterCrave</span>
            <h1>Smart buying guides for countertop kitchen appliances.</h1>
            <p>
              Clean, practical comparisons for shoppers choosing air fryers,
              blenders, toaster ovens and more — with clear trade-offs and
              disclosed Amazon recommendations.
            </p>
            <div className="button-row">
              <a className="button button-primary" href="#categories">
                Browse categories
              </a>
              <Link className="button button-secondary" href="/best-air-fryers/">
                Best air fryers
              </Link>
            </div>
          </div>

          <div className="decision-demo" aria-label="How CounterCrave helps">
            <div className="demo-toolbar">
              <span>Decision-first guides</span>
              <span className="demo-status">Live</span>
            </div>
            <div className="demo-product-row">
              <div className="demo-image" aria-hidden="true">
                ◎
              </div>
              <div>
                <span className="pick-label">Best overall</span>
                <strong>Pick for your kitchen fit</strong>
                <p>Capacity, cleanup and use case beat feature lists.</p>
              </div>
            </div>
            <div className="demo-verdict">
              <strong>Then check Amazon</strong>
              <p>
                Top picks appear early for decisions. Full commission product
                cards sit at the end so you can compare and buy with disclosure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Shop by category</span>
            <h2>All CounterCrave categories</h2>
          </div>
        </div>

        <div className="cluster-grid">
          {categoryHubs.map((category) => (
            <article className="cluster-card" key={category.slug}>
              <h3>
                <Link href={`/${category.slug}/`}>{category.name}</Link>
              </h3>
              <p>{category.description}</p>
              <Link href={`/${category.slug}/`}>Open guides</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Latest buying guides</span>
            <h2>Start with these comparisons</h2>
          </div>
        </div>

        <div className="guide-list">
          {latestGuides.map((page) => (
            <article className="guide-row" key={page.pageId}>
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
                Read guide
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
