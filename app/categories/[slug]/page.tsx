import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "../../components/GuideCard";
import { ProductOptionCard } from "../../components/ProductOptionCard";
import { categories, getCategory, products } from "../../data/site-data";
import { guides } from "../../data/guide-data";

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const categoryGuides = guides.filter((guide) => guide.category === slug);
  const categoryProducts = products.filter((product) => product.category === slug);
  const isAirFryer = slug === "air-fryers";
  const isBlender = slug === "blenders";

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <div className="article-breadcrumbs">
              <Link href="/">Home</Link><span>/</span><span>{category.name}</span>
            </div>
            <span className="eyebrow eyebrow-accent">{category.eyebrow}</span>
            <h1>{category.name}: choose by the job, space and cleanup.</h1>
            <p>{category.description} {category.promise}</p>
            <div className="button-row">
              {categoryGuides.length > 0 ? (
                <a href="#guides" className="button">Browse {categoryGuides.length} long guides</a>
              ) : (
                <a href="#framework" className="button">Use the buying framework</a>
              )}
              <Link href="/#finder" className="button button-secondary">Find my match</Link>
            </div>
          </div>
          <div className="page-hero-media product-mode">
            <img
              src={category.image}
              alt={category.imageAlt}
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>Featured starting model: {category.featuredModel}</span>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="framework">
        <div className="shell">
          <div className="section-heading section-heading-tight">
            <div>
              <span className="eyebrow">The category filter</span>
              <h2>Three checks before you open product tabs.</h2>
            </div>
            <p>Skip this category&apos;s most common trap: {category.avoid}</p>
          </div>
          <div className="category-principles">
            {category.lookFor.map((item, index) => (
              <article className="principle-card" key={item}>
                <span>0{index + 1}</span>
                <h3>{item}</h3>
                <p>{principleCopy(slug, index)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {categoryProducts.length > 0 && (
        <section className="section" id="product-library">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Expanded product library</span>
                <h2>Compare all {categoryProducts.length} researched {category.name.toLowerCase()}.</h2>
              </div>
              <p>
                Every model has a real product image, an ideal-user statement, explicit
                pros and cons, and a separate manufacturer or support source for checking
                the latest specifications.
              </p>
            </div>
            <div className="option-grid option-grid-wide">
              {categoryProducts.map((product, index) => (
                <ProductOptionCard
                  product={product}
                  label={`Model ${String(index + 1).padStart(2, "0")}`}
                  key={product.id}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {categoryGuides.length > 0 && (
        <section className="section section-tint" id="guides">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Long-form {category.name.toLowerCase()} guides</span>
                <h2>Start with the article closest to your use case.</h2>
              </div>
              <p>
                Each page includes a quick verdict, exact model comparison, detailed
                buyer guidance and a reason to choose something else.
              </p>
            </div>
            <div className="guide-grid">
              {categoryGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="shell hub-copy">
          <div>
            <span className="eyebrow">What a strong fit looks like</span>
            <h2>{category.promise}</h2>
            <p>
              A good purchase removes a repeated kitchen problem without creating a
              larger storage or cleaning problem. Compare the full workflow: setup,
              normal batch, transfer or serving, washing, drying and where every part
              goes afterwards.
            </p>
            <p>
              Product dimensions, included parts and care instructions can change by
              model revision or market. Confirm the current manufacturer page and manual
              before ordering, especially when clearance, cookware contact or electrical
              requirements are central to the decision.
            </p>
          </div>
          <div>
            <span className="eyebrow">How to use this hub</span>
            <h2>Choose the question before the product.</h2>
            <p>
              {isAirFryer
                ? "Start with household size and whether one or two cooking zones solve the normal dinner. Then compare basket floor, drawer clearance and cleaning access."
                : isBlender
                  ? "Start with serving size and the hardest weekly ingredient. Then choose personal cup, pitcher, immersion format or processor system before comparing motors."
                  : `Start with the specific job you expect ${category.name.toLowerCase()} to perform each week. Separate essential functions from attractive extras.`}
            </p>
            <p>
              Ignore temporary discounts until two or three suitable models remain. A
              sale on the wrong format is still a poor deal; a stable fit at a fair price
              is usually the lower-cost ownership decision.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function principleCopy(slug: string, index: number) {
  const category = getCategory(slug);
  const item = category?.lookFor[index] ?? "Fit";
  const endings = [
    `Check ${item.toLowerCase()} against the food, vessel or batch you use most often—not the largest claim on the box.`,
    `Make sure ${item.toLowerCase()} supports a weekly task and does not simply add controls, attachments or capacity you must store.`,
    `Read the current manual for ${item.toLowerCase()}, cleaning instructions, safety limits and replacement-part compatibility before purchase.`,
  ];
  return endings[index] ?? endings[0];
}
