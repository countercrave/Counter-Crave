import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "CounterCrave affiliate-link and editorial-independence disclosure for kitchen appliance buying guides.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">Clear before the click</span>
            <h1>Affiliate links support the site. They do not erase the tradeoffs.</h1>
            <p>
              Some CounterCrave links may earn a commission when a qualifying purchase
              is made. The buyer does not pay an added fee because of that link.
            </p>
            <div className="button-row">
              <Link href="/about" className="button">See how we choose</Link>
              <Link href="/guides" className="button button-secondary">Browse guides</Link>
            </div>
          </div>
          <figure className="page-hero-media product-mode">
            <img
              src="https://foodgressing.com/wp-content/uploads/2023/10/COSORI_6_Quart_TurboBlaze_Air_Fryer.jpg"
              alt="Real COSORI air fryer photographed on a kitchen counter"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>Retail links and manufacturer specification sources are labeled separately</span>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="shell legal-copy">
          <div className="legal-summary">
            <span className="eyebrow">The short version</span>
            <h2>CounterCrave may earn from qualifying purchases.</h2>
            <p>
              As an Amazon Associate, CounterCrave may earn from qualifying purchases.
              Other retailer or manufacturer links may also be affiliate links. A link&apos;s
              affiliate status does not increase the listed price for the reader.
            </p>
          </div>
          <div className="legal-sections">
            <section>
              <h2>How links are labeled</h2>
              <p>
                Product buttons leading to Amazon use sponsored and nofollow link
                attributes. Manufacturer or support links are shown separately as
                specification sources. Because seller and program status can change, a
                retailer button should be treated as a possible compensated link even
                when no commission is ultimately paid.
              </p>
            </section>
            <section>
              <h2>What commissions do not buy</h2>
              <p>
                Product inclusion is based on relevance to the article&apos;s use case. Each
                recommendation carries explicit pros, cons and a reason to skip it. We do
                not promise positive coverage in exchange for access, placement or a
                retailer relationship, and a manufacturer specification link is provided
                independently from the shopping destination where possible.
              </p>
            </section>
            <section>
              <h2>Prices, availability and model changes</h2>
              <p>
                Prices, coupons, sellers, bundles and stock can change without notice.
                CounterCrave therefore does not freeze a temporary price into a durable
                “best” label. Confirm the exact model number, included accessories,
                warranty, electrical requirements and return terms at the destination
                before completing a purchase.
              </p>
            </section>
            <section>
              <h2>Questions</h2>
              <p>
                For a question about this disclosure or a correction to a product page,
                email <a href="mailto:hello@countercrave.com">hello@countercrave.com</a>.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
