import Link from "next/link";
import { getAllPages, canShowContentPlan } from "@/lib/content";

export default function HomePage() {
  const allPlannedPages = getAllPages({ includeDrafts: true });
  const publishedPages = allPlannedPages.filter((page) => !page.draft);
  const plannedContent = allPlannedPages.filter(
    (page) => page.cluster !== "Trust" && page.cluster !== "Legal",
  );

  const clusters = Array.from(
    plannedContent.reduce((map, page) => {
      const current = map.get(page.cluster) || {
        name: page.cluster,
        total: 0,
        p1: 0,
        hubSlug: "",
      };
      current.total += 1;
      if (page.priority === "P1") current.p1 += 1;
      if (page.pageType === "Category Hub") current.hubSlug = page.slug;
      map.set(page.cluster, current);
      return map;
    }, new Map<string, { name: string; total: number; p1: number; hubSlug: string }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.p1 - a.p1 || b.total - a.total);

  const showPlan = canShowContentPlan();

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Independent kitchen gear research</span>
            <h1>Choose countertop appliances with fewer compromises.</h1>
            <p>
              CounterCrave turns verified specifications, practical criteria
              and clearly disclosed testing into useful buying decisions.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/how-we-test/">
                See our methodology
              </Link>
              <Link className="button button-secondary" href="/about/">
                About CounterCrave
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <strong>Project foundation included</strong>
            <ul>
              <li>{plannedContent.length} planned content URLs</li>
              <li>{clusters.length} topical clusters</li>
              <li>Amazon tag: visitbest07-20</li>
              <li>Draft-safe sitemap and indexing</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Content architecture</span>
            <h2>Kitchen appliance clusters</h2>
          </div>
          {showPlan ? (
            <Link href="/content-plan/">Open full local content plan</Link>
          ) : null}
        </div>

        <div className="cluster-grid">
          {clusters.map((cluster) => (
            <article className="cluster-card" key={cluster.name}>
              <span className="cluster-count">{cluster.total} pages</span>
              <h3>{cluster.name}</h3>
              <p>{cluster.p1} high-priority P1 pages are mapped.</p>
              {showPlan && cluster.hubSlug ? (
                <Link href={`/${cluster.hubSlug}/`}>
                  Preview local draft hub
                </Link>
              ) : (
                <span className="muted">Publishing after editorial QA</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="container trust-strip">
        <div>
          <strong>{publishedPages.length}</strong>
          <span>published trust pages</span>
        </div>
        <div>
          <strong>Original</strong>
          <span>analysis required</span>
        </div>
        <div>
          <strong>Visible</strong>
          <span>affiliate disclosure</span>
        </div>
        <div>
          <strong>Tracked</strong>
          <span>ASIN affiliate clicks</span>
        </div>
      </section>
    </main>
  );
}
