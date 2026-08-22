import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "../data/guide-data";
import { totalCatalogProducts, uniqueCatalogAsins } from "../data/catalog";
import { categories } from "../data/site-data";

export const metadata: Metadata = {
  title: "How CounterCrave Chooses Kitchen Products",
  description:
    "The product-fit method, source checks and editorial standards behind CounterCrave kitchen buying guides.",
};

const steps = [
  {
    title: "Define the buyer's real job",
    body: "We translate a broad search into a repeatable kitchen task: portions, hardest ingredient, batch pattern, counter space, storage and cleanup tolerance. A product cannot be a useful pick until that job is specific.",
  },
  {
    title: "Build a format-first shortlist",
    body: "Air fryers are split by basket geometry and cooking zones; blenders by cup, pitcher, immersion and processor formats; coffee makers by brew method; wine coolers by cooling type and venting. Different workflows are never ranked as if they were interchangeable.",
  },
  {
    title: "Clean the field before comparing it",
    body: "Every guide starts from the full Amazon result set for its question, then removes accessories, consumables, seasonings and colour duplicates. What remains is the list of actual models, each shown with the specs its listing states.",
  },
  {
    title: "Publish the reason to skip",
    body: "Every recommendation includes pros, watch-outs and a skip condition. The aim is not to make every model sound perfect; it is to show when an alternative is the better personal choice.",
  },
];

export default function AboutPage() {
  const lead = categories[0];
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">Our editorial method</span>
            <h1>We choose for the kitchen routine, not the biggest feature list.</h1>
            <p>
              CounterCrave is a decision-first kitchen buying site. Our guides connect product format
              to portions, recipes, counter fit and cleanup, then make the tradeoff visible before you
              follow a purchase link.
            </p>
            <div className="button-row">
              <Link href="/guides" className="button">Read the buying guides</Link>
              <Link href="/disclosure" className="button button-secondary">Affiliate disclosure</Link>
            </div>
          </div>
          <figure className="page-hero-media">
            <div className="plate plate-xl">
              <img src={lead.image} alt={lead.imageAlt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
            </div>
            <figcaption>{totalCatalogProducts} product listings compared · {uniqueCatalogAsins} distinct models · {guides.length} guides</figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">The four-stage process</span>
              <h2>How a product earns a place in a guide.</h2>
            </div>
            <p>The method exists to stop one generic ranking from being reused under a dozen search headings.</p>
          </div>
          <ol className="method-steps method-steps-light">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell page-prose">
          <div>
            <span className="eyebrow">What our labels mean</span>
            <h2>“Best” always has a boundary.</h2>
            <p>
              “Best overall” means the strongest fit for the most common version of the article&apos;s
              question. “Best value” means useful capability with fewer costly extras, not automatically
              the lowest price. “Best for” labels name the household, recipe or space that makes the
              tradeoff worthwhile.
            </p>
            <p>
              We do not present star averages, retailer rank or unattributed comments as evidence, and we
              do not claim hands-on testing unless a page documents a test. Guides are research and
              product-fit analysis built on each product&apos;s own listing and manufacturer documentation.
            </p>
          </div>
          <div>
            <span className="eyebrow">How to use our guides</span>
            <h2>Read the watch-outs and “skip it if” lines first.</h2>
            <p>
              Start with the verdict, then check whether the first pick&apos;s downside conflicts with your
              kitchen. Compare your normal batch, not a rare holiday batch, and measure the full operating
              space, including an open drawer, lid, ventilation clearance and every attachment you must store.
            </p>
            <p>
              Specifications, bundles and availability change. Confirm the exact model, included parts,
              voltage, dimensions, warranty and safety directions on the listing and current manual before
              you buy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
