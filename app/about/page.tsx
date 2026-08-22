import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "../data/guide-data";
import { totalSourceProductEntries, uniqueSourceAsinCount } from "../data/source-products";

export const metadata: Metadata = {
  title: "How CounterCrave Chooses Kitchen Products",
  description:
    "See the source-checking, product-fit and tradeoff standards behind CounterCrave kitchen buying guides.",
  alternates: { canonical: "/about" },
};

const steps = [
  {
    number: "01",
    title: "Define the buyer's real job",
    body: "We translate a broad search into a repeatable kitchen task: portions, hardest ingredient, batch pattern, available counter space, storage and cleanup tolerance. A product cannot be a useful pick until that job is specific.",
  },
  {
    number: "02",
    title: "Build a format-first shortlist",
    body: "Air fryers are separated by usable basket geometry and cooking zones. Blenders are separated into personal cups, full-size pitchers, immersion tools and processor systems. This keeps fundamentally different workflows from being ranked as though they were interchangeable.",
  },
  {
    number: "03",
    title: "Check specifications at the source",
    body: "Core capacity, vessel format, functions and model identity are checked against manufacturer product pages, manuals or support pages when available. Each product card links to that source so the reader can recheck current details.",
  },
  {
    number: "04",
    title: "Publish the reason to skip",
    body: "Every recommendation includes explicit pros, cons and a skip condition. The aim is not to make every model sound perfect; it is to show when an alternative is the more sensible personal choice.",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">Our editorial method</span>
            <h1>We choose for the kitchen routine, not the biggest feature list.</h1>
            <p>
              CounterCrave is a decision-first kitchen buying site. Our guides connect
              product format to portions, recipes, counter fit and cleanup, then make the
              tradeoff visible before a reader follows a purchase link.
            </p>
            <div className="button-row">
              <Link href="/guides" className="button">Read the buying guides</Link>
              <Link href="/disclosure" className="button button-secondary">Affiliate disclosure</Link>
            </div>
          </div>
          <figure className="page-hero-media">
            <img
              src="https://images.ctfassets.net/gscn32h7ckds/6Qsko0dGXGK8cBtwOhDODa/ed8224bd223523f650ab479f459d87ef/blender_outlet_2_CM.jpg"
              alt="Real blender and produce arranged on a working kitchen counter"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>{totalSourceProductEntries} source placements · {uniqueSourceAsinCount} unique ASINs · {guides.length} long-form guides</span>
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
            <p>
              The method is designed to prevent one generic ranking from being reused
              under multiple search headings.
            </p>
          </div>
          <div className="method-card-grid">
            {steps.map((step) => (
              <article className="method-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell page-prose">
          <div>
            <span className="eyebrow">What our labels mean</span>
            <h2>“Best” always has a boundary.</h2>
            <p>
              “Best overall” means the strongest fit for the most common version of the
              article&apos;s question. “Best value” means useful capability with fewer costly
              extras, not automatically the lowest sticker price. “Best for” labels name
              the household, recipe or workflow that makes the tradeoff worthwhile.
            </p>
            <p>
              We do not present marketplace star averages, retailer rank or unattributed
              comments as independent evidence. We also do not claim hands-on testing
              unless a page specifically documents a test method and result. Current
              guides are research and product-fit analysis, with source links shown beside
              the models.
            </p>
          </div>
          <div>
            <span className="eyebrow">How to use our guides</span>
            <h2>Read the “Cons” and “Skip if” boxes first.</h2>
            <p>
              Start with the direct verdict, then check whether the first pick&apos;s downside
              conflicts with your kitchen. Compare the normal batch—not a rare holiday
              batch—and measure the full operating space, including an open drawer, lid,
              ventilation clearance and every attachment you must store.
            </p>
            <p>
              Specifications, bundles and availability can change. Confirm the exact model
              suffix, included parts, voltage, dimensions, warranty and safety directions
              on the linked manufacturer page and current manual before purchase.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
