import Link from "next/link";
import { GuideCard } from "./components/GuideCard";
import { KitchenFinder, type FinderProduct } from "./components/KitchenFinder";
import { BuyButton, ProductPlate, SpecStrip } from "./components/ProductPlate";
import { getCatalogProduct, totalCatalogProducts } from "./data/catalog";
import { guides } from "./data/guide-data";
import { categories, getProduct } from "./data/site-data";

const featuredSlugs = [
  "best-air-fryers-2026",
  "best-pizza-oven-for-home",
  "best-wine-cooler-for-the-kitchen",
  "best-blender-for-smoothies",
  "best-single-serve-coffee-maker",
  "best-built-in-wine-and-beverage-fridge",
];

const finderAsins: Record<string, string> = {
  "cosori-turboblaze": "B0C33CHG99",
  "ninja-af141": "B0CSZ7WBYW",
  "ninja-dz401": "B096X9LGJ1",
  "nutribullet-pro": "B0GS4Z9QXP",
  "ninja-bn701": "B0855B5Z6F",
  "braun-multiquick-7": "B085FRKBMF",
  "ninja-bn801": "B08559K7CN",
  "keurig-k-express": "B09715G57M",
  espresso: "B0DQWC47JN",
  "toshiba-rice": "B091TW6ND5",
  "nesco-vs12": "B01KCK9W1K",
  "presto-pizzazz": "B00005IBXJ",
  "ninja-artisan": "B0DWTFBFWT",
  "cuisinart-wine": "B08F2JR83Y",
  "ivation-12": "B0864S2FPR",
};

const finderProducts: Record<string, FinderProduct> = Object.fromEntries(
  Object.entries(finderAsins).flatMap(([key, asin]) => {
    const product = getCatalogProduct(asin);
    return product ? [[key, { name: product.name, image: product.image, buyUrl: product.amazonUrl }]] : [];
  }),
);

const featuredGuides = featuredSlugs
  .map((slug) => guides.find((guide) => guide.slug === slug))
  .filter((guide): guide is (typeof guides)[number] => Boolean(guide));

export default function Home() {
  const heroPick = getProduct("cosori-turboblaze");
  const heroCatalog = heroPick ? getCatalogProduct(heroPick.asin) : undefined;
  const newGuides = guides.filter((guide) => guide.isNew);

  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="shell hero-layout">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-accent">Kitchen buying guides · {guides.length} guides, {totalCatalogProducts} Amazon listings compared</span>
            <h1>Buy the appliance that fits your cooking, not the longest feature list.</h1>
            <p className="hero-lede">
              Every guide opens with a straight answer, shows the three models that fit different kitchens,
              then compares the whole field so you can see why the pick is the pick.
            </p>
            <div className="button-row">
              <Link href="#finder" className="button">Find my match</Link>
              <Link href="/guides" className="button button-secondary">Browse all guides</Link>
            </div>
            <ul className="hero-proof" aria-label="What you get">
              <li>Three picks per guide, each with a reason to skip it</li>
              <li>Real Amazon product photos and direct listings</li>
              <li>No invented reviews or star ratings</li>
            </ul>
          </div>
          {heroPick && (
            <aside className="hero-pick" aria-label="Most recommended model">
              <span className="award-sticker">Our most recommended model</span>
              <ProductPlate src={heroPick.image} alt={heroPick.imageAlt} size="xl" priority />
              <div className="hero-pick-copy">
                <span className="brand-line">{heroPick.format}</span>
                <h2>{heroPick.name}</h2>
                <SpecStrip items={heroCatalog?.specs.length ? heroCatalog.specs : [heroPick.capacity, heroPick.power]} />
                <p>{heroPick.bestFor}</p>
                <div className="button-row">
                  <BuyButton href={heroPick.buyUrl} />
                  <Link href="/guides/best-air-fryers-2026" className="text-link">Read the full verdict <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {newGuides.length > 0 && (
        <section className="section section-flush" id="new">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Just published</span>
                <h2>Three new guides: pizza ovens, wine coolers and built-in beverage fridges.</h2>
              </div>
              <p>Each one compares the full Amazon field, minus the accessories and duplicates that clutter a search.</p>
            </div>
            <div className="guide-grid guide-grid-three">
              {newGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section section-tint" id="categories">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Browse by appliance</span>
              <h2>Start with the appliance, then narrow by what you cook.</h2>
            </div>
            <p>Each hub explains the three checks that matter for that appliance before you open a single listing.</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const count = guides.filter((guide) => guide.category === category.slug).length;
              return (
                <article className="category-card" key={category.slug}>
                  <Link href={`/categories/${category.slug}`} className="category-card-media" aria-label={category.name}>
                    <img src={category.image} alt={category.imageAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  </Link>
                  <div className="category-card-body">
                    <span className="eyebrow">{category.eyebrow}</span>
                    <h3><Link href={`/categories/${category.slug}`}>{category.name}</Link></h3>
                    <p>{category.description}</p>
                    <div className="guide-card-meta">
                      <span>{count} {count === 1 ? "guide" : "guides"}</span>
                      <Link href={`/categories/${category.slug}`} className="text-link">Open the hub <span aria-hidden="true">→</span></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="finder">
        <div className="shell">
          <div className="section-heading section-heading-tight">
            <div>
              <span className="eyebrow">Match finder</span>
              <h2>Tell us three things. Get a starting point.</h2>
            </div>
            <p>This is a fit recommendation, not a score. Change any answer and the result updates.</p>
          </div>
          <KitchenFinder products={finderProducts} />
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Most useful starting guides</span>
              <h2>Quick answer first. Tradeoffs right after.</h2>
            </div>
            <Link href="/guides" className="button button-secondary button-small">See every guide</Link>
          </div>
          <div className="guide-grid guide-grid-three">
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
              Marketplace rank and preset count do not decide our order. We connect a model&apos;s
              format to portions, ingredients, space and the friction of owning it.
            </p>
            <Link href="/about" className="button button-light">See the full method</Link>
          </div>
          <ol className="method-steps">
            <li><span>1</span><div><h3>Name the repeated job</h3><p>We start with what you cook every week, not a rare edge case.</p></div></li>
            <li><span>2</span><div><h3>Check the real fit</h3><p>Basket floor, jar shape, venting, counter clearance and storage all count.</p></div></li>
            <li><span>3</span><div><h3>Clear out the noise</h3><p>Accessories, seasonings and colour duplicates are removed before we compare models.</p></div></li>
            <li><span>4</span><div><h3>Show the reason to skip</h3><p>Every recommendation names the kitchen it is wrong for.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell closing-cta">
          <div>
            <span className="eyebrow">Still comparing?</span>
            <h2>Open the guide closest to your real question.</h2>
            <p>Every guide starts with a direct recommendation, then shows exactly who should choose a different model.</p>
          </div>
          <div className="button-row">
            <Link href="/guides/best-air-fryers-2026" className="button">Compare air fryers</Link>
            <Link href="/guides/best-pizza-oven-for-home" className="button button-secondary">Compare pizza ovens</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
