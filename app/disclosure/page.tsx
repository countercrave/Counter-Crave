import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "../data/site-data";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "CounterCrave affiliate-link and editorial-independence disclosure for kitchen appliance buying guides.",
};

export default function DisclosurePage() {
  const lead = categories[2];
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">Clear before the click</span>
            <h1>Affiliate links support the site. They do not change the picks.</h1>
            <p>
              Some CounterCrave links earn a commission when a qualifying purchase is made. You do not
              pay more because of that link.
            </p>
            <div className="button-row">
              <Link href="/about" className="button">See how we choose</Link>
              <Link href="/guides" className="button button-secondary">Browse guides</Link>
            </div>
          </div>
          <figure className="page-hero-media">
            <div className="plate plate-xl">
              <img src={lead.image} alt={lead.imageAlt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
            </div>
            <figcaption>Retail links and manufacturer specification sources are labeled separately</figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="shell legal-copy">
          <div className="legal-summary">
            <span className="eyebrow">The short version</span>
            <h2>CounterCrave earns from qualifying purchases.</h2>
            <p>
              As an Amazon Associate, CounterCrave earns from qualifying purchases. Other retailer or
              manufacturer links may also be affiliate links. A link&apos;s affiliate status never increases
              the price you pay.
            </p>
          </div>
          <div className="legal-sections">
            <section>
              <h2>How links are labeled</h2>
              <p>
                “Buy Now” buttons lead to Amazon and carry sponsored and nofollow attributes.
                Manufacturer or support links are shown separately as specification sources. Because
                seller and program status change, treat any retailer button as a possible compensated link.
              </p>
            </section>
            <section>
              <h2>What commissions do not buy</h2>
              <p>
                Product inclusion is based on relevance to the article&apos;s question. Each recommendation
                carries pros, watch-outs and a reason to skip it. We do not promise positive coverage in
                exchange for access, placement or a retailer relationship.
              </p>
            </section>
            <section>
              <h2>Prices, availability and model changes</h2>
              <p>
                Prices, coupons, sellers, bundles and stock change without notice, so we do not freeze a
                temporary price into a durable “best” label. Confirm the exact model, included accessories,
                warranty, electrical requirements and return terms before completing a purchase.
              </p>
            </section>
            <section>
              <h2>Questions</h2>
              <p>
                For a question about this disclosure or a correction to a product page, email{" "}
                <a href="mailto:hello@countercrave.com">hello@countercrave.com</a>.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
