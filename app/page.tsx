import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard } from "./components/GuideCard";
import { KitchenFinder } from "./components/KitchenFinder";
import { categories } from "./data/site-data";
import { guides } from "./data/guide-data";
import { totalSourceProductEntries } from "./data/source-products";

export const metadata: Metadata = {
  title: "CounterCrave Kitchen Guides | Decision-First Appliance Advice",
  description:
    "Long-form air fryer and blender guides, product breakdowns, recipes and safe kitchen appliance buying advice.",
  alternates: { canonical: "/" },
};

const featuredSlugs = [
  "best-non-toxic-air-fryer",
  "best-air-fryer-crispy-tofu-recipe",
  "best-blender-for-smoothies",
  "best-way-to-clean-air-fryer",
];

const featuredGuides = featuredSlugs
  .map((slug) => guides.find((guide) => guide.slug === slug))
  .filter((guide): guide is (typeof guides)[number] => Boolean(guide));

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="shell hero-layout">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-accent">Smarter kitchen buying starts here</span>
            <h1>Pick the kitchen tool that fits your food—not the loudest feature list.</h1>
            <p className="hero-lede">
              Long-form, source-checked guides turn basket size, jar shape, cleanup,
              storage and real recipes into a clear <strong>buy this / skip this</strong> decision.
            </p>
            <div className="button-row">
              <Link href="#finder" className="button">Find my best match</Link>
              <Link href="/guides" className="button button-secondary">Browse all guides</Link>
            </div>
            <ul className="hero-proof" aria-label="Site promises">
              <li><span>✓</span> Exact model guidance</li>
              <li><span>✓</span> Real product images</li>
              <li><span>✓</span> No invented reviews</li>
            </ul>
          </div>
          <aside className="hero-pick" aria-label="Featured kitchen pick">
            <div className="hero-pick-topline">
              <span className="score-badge">Best overall fit</span>
              <span className="source-status"><i /> Source checked</span>
            </div>
            <div className="hero-product-image">
              <img
                src="https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg"
                alt="Real COSORI TurboBlaze six-quart air fryer"
                fetchPriority="high"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="eyebrow">For most 2–4 person kitchens</span>
            <h2>COSORI TurboBlaze 6-Qt</h2>
            <p>
              A broad square basket and manageable footprint create the best all-round
              balance. Skip it if you need two foods at separate temperatures.
            </p>
            <div className="spec-chips">
              <span>6 qt</span><span>Single basket</span><span>9 functions</span>
            </div>
            <Link href="/guides/best-air-fryers-2026" className="text-link">
              Read the full verdict <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
        <div className="shell home-stats" aria-label="CounterCrave coverage">
          <div><strong>{guides.length}</strong><span>long-form guides</span></div>
          <div><strong>9</strong><span>kitchen categories</span></div>
          <div><strong>{totalSourceProductEntries}</strong><span>source product placements</span></div>
          <div><strong>0</strong><span>fabricated testimonials</span></div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Browse by kitchen task</span>
              <h2>Start with the appliance category. Then narrow by workflow.</h2>
            </div>
            <p>
              Each hub uses category-specific buying criteria instead of repeating the
              same generic checklist.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-card" key={category.slug}>
                <Link href={`/categories/${category.slug}`} className="category-card-image" aria-label={category.name}>
                  <img
                    src={category.image}
                    alt={category.imageAlt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <span>{category.eyebrow}</span>
                </Link>
                <div className="category-card-body">
                  <h3><Link href={`/categories/${category.slug}`}>{category.name}</Link></h3>
                  <p>{category.description}</p>
                  <Link href={`/categories/${category.slug}`} className="text-link">
                    Explore {category.name} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" id="finder">
        <div className="shell">
          <div className="section-heading section-heading-tight">
            <div>
              <span className="eyebrow">Interactive match finder</span>
              <h2>Tell us three things. Get a useful starting point.</h2>
            </div>
            <p>
              This is a fit recommendation, not a fake universal score. Change any answer
              and the result updates immediately.
            </p>
          </div>
          <KitchenFinder />
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Most useful starting guides</span>
              <h2>Quick answer first. Tradeoffs immediately after.</h2>
            </div>
            <Link href="/guides" className="button button-secondary button-small">See every guide</Link>
          </div>
          <div className="guide-grid guide-grid-featured">
            {featuredGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell method-layout">
          <div className="method-intro">
            <span className="eyebrow eyebrow-light">How we narrow the choice</span>
            <h2>A product earns its place by solving a real kitchen constraint.</h2>
            <p>
              Marketplace rank and preset count do not decide our order. We connect the
              model&apos;s format to portions, ingredients, space and ownership friction.
            </p>
            <Link href="/about" className="button button-light">See our complete method</Link>
          </div>
          <ol className="method-steps">
            <li><span>01</span><div><h3>Name the repeated job</h3><p>We start with what the reader cooks weekly, not a rare edge case.</p></div></li>
            <li><span>02</span><div><h3>Check the real fit</h3><p>Basket floor, jar format, counter clearance and storage all count.</p></div></li>
            <li><span>03</span><div><h3>Surface the tradeoff</h3><p>Every recommendation includes a clear reason to skip it.</p></div></li>
            <li><span>04</span><div><h3>Verify at the source</h3><p>Core model details link back to current manufacturer information.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell decision-layout">
          <div className="decision-photo">
            <img
              src="https://images.ctfassets.net/gscn32h7ckds/6Qsko0dGXGK8cBtwOhDODa/ed8224bd223523f650ab479f459d87ef/blender_outlet_2_CM.jpg"
              alt="Real blender with fresh produce on a kitchen counter"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>Buy for the recipe you repeat.</span>
          </div>
          <div className="decision-copy">
            <span className="eyebrow">A faster decision framework</span>
            <h2>Four questions remove most bad options.</h2>
            <div className="question-list">
              <details open>
                <summary>1. What is the hardest weekly task?</summary>
                <p>Frozen mango is more demanding than a banana shake. Two-temperature dinners are different from reheating pizza. Buy for the real weekly maximum.</p>
              </details>
              <details>
                <summary>2. What is the normal batch—not the holiday batch?</summary>
                <p>One daily drink belongs in a personal cup. Two air-fryer portions usually fit a broad five- or six-quart basket. Rare guests should not control the purchase.</p>
              </details>
              <details>
                <summary>3. Where will every piece live?</summary>
                <p>Measure the assembled appliance, the open drawer or lid path, ventilation space and every attachment. Storage is part of product performance.</p>
              </details>
              <details>
                <summary>4. What will make cleanup annoying?</summary>
                <p>Window seams, stacked blades, gaskets and oversized pitchers can turn a good cook into a poor daily fit. Choose the friction you will actually tolerate.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell closing-cta">
          <div>
            <span className="eyebrow">Still comparing?</span>
            <h2>Open the guide closest to your real question.</h2>
            <p>Every guide starts with a direct recommendation, then shows exactly who should choose a different model.</p>
          </div>
          <div className="button-row">
            <Link href="/guides/best-air-fryers-2026" className="button">Compare air fryers</Link>
            <Link href="/guides/best-blender-for-smoothies" className="button button-secondary">Compare blenders</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
