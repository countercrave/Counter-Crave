import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "../../components/GuideCard";
import { BuyButton, ProductPlate, SpecStrip } from "../../components/ProductPlate";
import { categories, getCategory } from "../../data/site-data";
import { guides } from "../../data/guide-data";
import { pickView, resolvePicks } from "../../data/guide-helpers";
import type { PickView } from "../../components/PickCard";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} Buying Guides`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: `${category.name} Buying Guides | CounterCrave`,
      description: category.description,
      images: [{ url: category.image, alt: category.imageAlt }],
    },
    twitter: { images: [category.image] },
  };
}

/** The models that show up most often as top picks across the hub's guides. */
function mostRecommended(slug: string): { pick: PickView; mentions: number }[] {
  const tally = new Map<string, { pick: PickView; mentions: number }>();
  for (const guide of guides.filter((item) => item.category === slug)) {
    resolvePicks(guide).forEach((resolved, index) => {
      const view = pickView(resolved, index);
      const key = view.buyUrl;
      const entry = tally.get(key);
      if (entry) entry.mentions += 1;
      else tally.set(key, { pick: view, mentions: 1 });
    });
  }
  return Array.from(tally.values()).sort((a, b) => b.mentions - a.mentions).slice(0, 6);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const categoryGuides = guides.filter((guide) => guide.category === slug);
  const buyingGuides = categoryGuides.filter((guide) => !guide.contentType || guide.contentType === "buying");
  const howTos = categoryGuides.filter((guide) => guide.contentType && guide.contentType !== "buying");
  const recommended = mostRecommended(slug);
  const repeatPicks = recommended.some((entry) => entry.mentions > 1);
  const starter = buyingGuides[0];

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span>/</span><span>{category.name}</span>
            </nav>
            <span className="eyebrow eyebrow-accent">{category.eyebrow}</span>
            <h1>{category.name}: {category.promise.toLowerCase()}</h1>
            <p>{category.description}</p>
            <div className="button-row">
              {starter && <Link href={`/guides/${starter.slug}`} className="button">Start with {starter.title.split(":")[0]}</Link>}
              <a href="#guides" className="button button-secondary">All {categoryGuides.length} guides</a>
            </div>
          </div>
          <figure className="page-hero-media">
            <div className="plate plate-xl">
              <img src={category.image} alt={category.imageAlt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
            </div>
            <figcaption>Most recommended model: {category.featuredModel}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section section-tint" id="checks">
        <div className="shell">
          <div className="section-heading section-heading-tight">
            <div>
              <span className="eyebrow">Before you open a listing</span>
              <h2>Three checks that decide the right {category.shortName.toLowerCase().replace(/s$/, "")}.</h2>
            </div>
            <p>{category.howToUse} The most common trap: {category.avoid}</p>
          </div>
          <div className="principle-grid">
            {category.lookFor.map((item, index) => (
              <article className="principle-card" key={item.title}>
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="section" id="recommended">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{repeatPicks ? "Most recommended" : "Top picks"}</span>
                <h2>
                  {repeatPicks
                    ? `The ${category.shortName.toLowerCase()} our guides keep coming back to.`
                    : `The ${category.shortName.toLowerCase()} that earned a top-pick award.`}
                </h2>
              </div>
              <p>
                {repeatPicks
                  ? `Counted across every ${category.shortName.toLowerCase()} guide on the site. A model that wins several different questions is usually a safe default.`
                  : `Each one answers a different question in the ${category.shortName.toLowerCase()} guides. Open the guide for the full reasoning and the rest of the field.`}
              </p>
            </div>
            <div className="recommended-grid">
              {recommended.map(({ pick, mentions }, index) => (
                <article className="recommended-card" key={pick.key}>
                  <ProductPlate src={pick.image} alt={pick.imageAlt} size="md">
                    <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                  </ProductPlate>
                  <div className="recommended-body">
                    <span className="brand-line">{mentions === 1 ? pick.award : `Picked in ${mentions} guides`}</span>
                    <h3>{pick.name}</h3>
                    <SpecStrip items={pick.specs.slice(0, 3)} />
                    <p>{pick.reason}</p>
                    <BuyButton href={pick.buyUrl} small />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-tint" id="guides">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{category.name} guides</span>
              <h2>Start with the question closest to yours.</h2>
            </div>
            <p>Each guide opens with a verdict, three picks with a reason to skip each, then the rest of the field.</p>
          </div>
          <div className="guide-grid guide-grid-three">
            {buyingGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
          {howTos.length > 0 && (
            <>
              <div className="section-heading section-heading-tight subsection-heading">
                <div>
                  <span className="eyebrow">How-to and recipes</span>
                  <h2>Get more out of the one you own.</h2>
                </div>
              </div>
              <div className="guide-grid guide-grid-three">
                {howTos.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section" id="foundation">
        <div className="shell foundation-layout">
          <div className="foundation-intro">
            <span className="eyebrow">The fundamentals</span>
            <h2>What every {category.shortName.toLowerCase()} guide assumes you know.</h2>
            <p>Read this once and the individual guides get shorter and clearer. Dimensions, included parts and care instructions change by model revision, so confirm the current manual before ordering.</p>
          </div>
          <div className="foundation-body">
            {category.foundation.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
