import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CuratedBestPickCard, SourceBestPickCard } from "../../components/BestPickCard";
import { GuideCard } from "../../components/GuideCard";
import { ProductOptionCard } from "../../components/ProductOptionCard";
import { SourceProductCard } from "../../components/SourceProductCard";
import { getGuide, guides, type GuidePick } from "../../data/guide-data";
import { getProduct, products, type Product } from "../../data/site-data";
import { getSourceFileName, getSourceProducts, type SourceProduct } from "../../data/source-products";
import { absoluteUrl } from "../../../lib/site";

type GuidePageProps = { params: Promise<{ slug: string }> };
type ResolvedPick =
  | { kind: "source"; pick: GuidePick; product: SourceProduct }
  | { kind: "curated"; pick: GuidePick; product: Product };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const socialImage = getSourceProducts(slug)[0]?.image ?? guide.image;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      images: [{ url: socialImage, alt: guide.imageAlt }],
      modifiedTime: "2026-08-22T00:00:00Z",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [socialImage],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const sourceProducts = getSourceProducts(guide.slug);
  const sourceFileName = getSourceFileName(guide.slug);
  const resolvedPicks = guide.picks.flatMap<ResolvedPick>((pick) => {
    if (pick.sourceAsin) {
      const product = sourceProducts.find((candidate) => candidate.asin === pick.sourceAsin);
      return product ? [{ kind: "source" as const, pick, product }] : [];
    }
    if (pick.productId) {
      const product = getProduct(pick.productId);
      return product ? [{ kind: "curated" as const, pick, product }] : [];
    }
    return [];
  });
  const curatedPicks = resolvedPicks.filter(
    (item): item is Extract<ResolvedPick, { kind: "curated" }> => item.kind === "curated",
  );
  const isEditorial = Boolean(guide.contentType && guide.contentType !== "buying");
  const topPickIds = new Set(curatedPicks.map(({ product }) => product.id));
  const moreProducts = sourceProducts.length || isEditorial
    ? []
    : productsForGuide(guide.slug, guide.category)
        .filter((product) => !topPickIds.has(product.id));
  const totalCompared = sourceProducts.length || resolvedPicks.length + moreProducts.length;
  const schemaProducts = sourceProducts.length
    ? sourceProducts.map((product) => ({
        name: product.title,
        image: product.image,
        description: `Product ${product.position} from the supplied HTML; ASIN ${product.asin}.`,
        url: product.amazonUrl,
      }))
    : [...curatedPicks.map(({ product }) => product), ...moreProducts].map((product) => ({
        name: product.name,
        image: product.image,
        description: product.bestFor,
        url: product.sourceUrl,
      }));
  const expandedReadMinutes = Math.max(
    Number.parseInt(guide.readTime, 10) || 12,
    Math.round(13 + moreProducts.length * 0.7),
    Math.round(14 + sourceProducts.length * 1.35),
  );
  const featuredImage = sourceProducts[0]?.image ?? guide.image;
  const featuredImageAlt = sourceProducts[0]
    ? `${sourceProducts[0].title} real product image featured for ${guide.title}`
    : guide.imageAlt;
  const categoryName = guide.category === "air-fryers" ? "Air Fryers" : "Blenders";
  const related = guides
    .filter((candidate) => candidate.category === guide.category && candidate.slug !== guide.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: [featuredImage],
    dateModified: "2026-08-22",
    datePublished: "2026-08-22",
    author: { "@type": "Organization", name: "CounterCrave Editorial" },
    publisher: { "@type": "Organization", name: "CounterCrave" },
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${guide.title} product comparison`,
    numberOfItems: schemaProducts.length,
    itemListElement: schemaProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.image,
        description: product.description,
        url: product.url,
      },
    })),
  };
  const recipeIngredients = guide.contentSections?.find((section) => section.id === "ingredients")?.bullets ?? [];
  const recipeSteps = guide.contentSections?.find((section) => section.id === "recipe-steps")?.steps ?? [];
  const cleaningSteps = guide.contentSections?.find((section) => section.id === "after-every-use")?.steps ?? [];
  const specialGuideSchema = guide.contentType === "recipe"
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: guide.title,
        image: [featuredImage],
        description: guide.description,
        author: { "@type": "Organization", name: "CounterCrave Editorial" },
        dateModified: "2026-08-22",
        recipeYield: "2 side servings",
        prepTime: "PT20M",
        cookTime: "PT16M",
        recipeIngredient: recipeIngredients,
        recipeInstructions: recipeSteps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.body })),
      }
    : guide.contentType === "cleaning"
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: guide.title,
          image: [featuredImage],
          description: guide.description,
          totalTime: "PT15M",
          step: cleaningSteps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.body })),
        }
      : null;

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema).replace(/</g, "\\u003c") }}
      />
      {specialGuideSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(specialGuideSchema).replace(/</g, "\\u003c") }}
        />
      )}

      <header className="article-hero">
        <div className="shell">
          <div className="article-breadcrumbs">
            <Link href="/">Home</Link><span>/</span>
            <Link href={`/categories/${guide.category}`}>{categoryName}</Link><span>/</span>
            <span>{isEditorial ? "Kitchen how-to" : "Buying guide"}</span>
          </div>
          <div className="article-featured-hero">
            <div className="article-featured-copy">
              <span className="eyebrow eyebrow-accent">{guide.eyebrow}</span>
              <h1>{guide.title}</h1>
              <p className="article-dek">{guide.description}</p>
              <div className="article-meta">
                <span>Updated {guide.updated}</span>
                <span>{expandedReadMinutes} min read</span>
                {totalCompared > 0 && <span>{totalCompared} products listed</span>}
                <span>{resolvedPicks.length} visual best-pick cards</span>
                {sourceProducts.length > 0 && <span>All supplied HTML listings retained</span>}
              </div>
              <div className="author-line">
                <span className="author-avatar" aria-hidden="true">CC</span>
                <span><strong>CounterCrave Editorial</strong><br />Product-fit research and kitchen buying guidance</span>
              </div>
            </div>
            <figure className="article-featured-media">
              <img
                src={featuredImage}
                alt={featuredImageAlt}
                fetchPriority="high"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <figcaption>
                <strong>{sourceProducts[0] ? "Real product image" : "Real editorial image"}</strong>
                {sourceProducts[0]
                  ? <>Supplied listing #1 · ASIN {sourceProducts[0].asin}</>
                  : <>Featured product for this guide</>}
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <div className="article-jumpbar" aria-label="Article navigation">
        <div className="shell article-jumpbar-inner">
          <strong>Jump to</strong>
          <nav>
            <a href="#quick-answer">Quick answer</a>
            {guide.contentSections?.map((section) => <a href={`#${section.id}`} key={section.id}>{section.eyebrow}</a>)}
            <a href="#comparison">Best picks</a>
            {curatedPicks.length > 0 && <a href="#reviews">Top reviews</a>}
            {sourceProducts.length > 0 && <a href="#all-products">All {sourceProducts.length} products</a>}
            {moreProducts.length > 0 && <a href="#more-products">More products</a>}
            <a href="#how-to-choose">{isEditorial ? "Core principles" : "How to choose"}</a>
            {!isEditorial && <a href="#buyers-guide">Buyer guide</a>}
            <a href="#decision-rules">Decision rules</a>
            <a href="#mistakes">Mistakes</a>
            <a href="#method">Method</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </div>

      <div className="article-shell">

        <article className="article-content">
          <section className="verdict-box" id="quick-answer">
            <span className="eyebrow">Quick answer</span>
            <h2>{guide.verdict}</h2>
            <p>{guide.verdictReason}</p>
            <div className="verdict-links">
              {resolvedPicks.map(({ pick }, index) => (
                <a href={`#pick-${index + 1}`} key={`${pick.award}-${index}`}>{pick.award}</a>
              ))}
            </div>
          </section>

          {guide.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {guide.contentSections?.map((section) => (
            <section className="editorial-section" id={section.id} key={section.id}>
              <span className="eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.steps && (
                <ol className="editorial-step-grid">
                  {section.steps.map((step, index) => (
                    <li key={step.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{step.title}</h3><p>{step.body}</p></div>
                    </li>
                  ))}
                </ol>
              )}
              {section.bullets && (
                <ul className="editorial-bullet-grid">
                  {section.bullets.map((bullet, index) => (
                    <li key={bullet}><span>{String(index + 1).padStart(2, "0")}</span>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {(guide.contentType === "ideas" || guide.slug.includes("chicken")) && (
            <div className="safety-source-note">
              <strong>Food-safety check</strong>
              USDA guidance sets 165°F as the safe minimum for all poultry and for reheated
              leftovers. Measure with a food thermometer; do not rely on color or time alone.
              <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart" target="_blank" rel="noopener">USDA safe-temperature chart</a>
            </div>
          )}

          <section id="comparison">
            <span className="eyebrow">Visual best picks</span>
            <h2>{guide.picksHeading ?? "Which model fits which buyer?"}</h2>
            <p>
              {guide.picksIntro ?? "Compare format, normal batch, the clearest advantage and the ownership watchout. Prices are intentionally not frozen into these cards because promotions and sellers change; establish fit before opening the current offer."}
            </p>
            <div className="best-pick-grid">
              {resolvedPicks.map((item, index) => item.kind === "source" ? (
                <SourceBestPickCard index={index} pick={item.pick} product={item.product} key={`${item.product.asin}-${index}`} />
              ) : (
                <CuratedBestPickCard index={index} pick={item.pick} product={item.product} key={`${item.product.id}-${index}`} />
              ))}
            </div>
          </section>

          {curatedPicks.length > 0 && (
          <section id="reviews">
            <span className="eyebrow">Detailed top picks</span>
            <h2>Why these products made the shortlist</h2>
            <p>
              These are use-case recommendations, not a claim that one appliance wins
              every test for every buyer. Read the “skip if” note as carefully as the
              award. The best conversion is a well-matched purchase, not simply a click.
            </p>
            <div className="product-review-list">
              {curatedPicks.map(({ pick, product }, index) => {
                const amazon = product.buyUrl.includes("amazon.com");
                return (
                  <article className="product-review" id={product.id} key={product.id}>
                    <div className="product-review-media">
                      <img
                        src={product.image}
                        alt={product.imageAlt}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="product-review-copy">
                      <span className="award-pill">{index + 1}. {pick.award}</span>
                      <h3>{product.name}</h3>
                      <p>{pick.reason}</p>
                      <p>
                        The core fit is <strong>{product.format.toLowerCase()}</strong> with
                        {" "}{product.capacity.toLowerCase()} capacity and {product.power.toLowerCase()}.
                        That combination is most useful for {product.bestFor.toLowerCase()}
                        {" "}It is a better buying signal than a long preset list because it
                        describes the container, batch and control system you will handle each day.
                      </p>
                      <p>
                        Ownership still has a clear boundary: {product.skipIf} {pick.watchout}
                        {" "}Before ordering, compare the current manual, included accessories,
                        warranty and exact model suffix. Retailer bundles can look identical while
                        including different cups, racks, lids or regional power specifications.
                      </p>
                      <div className="spec-chips">
                        {product.features.map((feature) => <span key={feature}>{feature}</span>)}
                      </div>
                      <div className="pros-cons-grid">
                        <div className="pros-list">
                          <strong>Pros</strong>
                          <ul>
                            {product.features.map((feature) => <li key={feature}>{feature}</li>)}
                          </ul>
                        </div>
                        <div className="cons-list">
                          <strong>Cons</strong>
                          <ul>
                            {product.cons.map((con) => <li key={con}>{con}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="fit-grid">
                        <div className="fit-note"><strong>Best for</strong>{product.bestFor}</div>
                        <div className="fit-note skip"><strong>Skip if</strong>{product.skipIf}</div>
                      </div>
                      <div className="product-actions">
                        <a
                          className="button button-small"
                          href={product.buyUrl}
                          target="_blank"
                          rel={amazon ? "sponsored nofollow noopener" : "noopener"}
                        >
                          {amazon ? "Check current offer" : "View official product"}
                        </a>
                        <a className="source-link" href={product.sourceUrl} target="_blank" rel="noopener">
                          Specs source: {product.sourceName}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          )}

          {sourceProducts.length > 0 && (
            <section id="all-products" className="source-products-section">
              <span className="eyebrow">Complete supplied product listing</span>
              <h2>All {sourceProducts.length} relevant products retained from your HTML</h2>
              <p>
                This is the complete article-specific product set extracted from
                {sourceFileName ? <> <strong>{sourceFileName}</strong></> : " the supplied HTML"}.
                The order, exact ASIN, marketplace title and real product image are preserved so
                a reader can compare the same models that were present in the original research
                file. Nothing has been reduced to a small shared catalog.
              </p>
              <p>
                Use the format guidance first, then open only the two or three exact ASINs that
                fit your batch size and routine. Pros and cons below are buyer-fit notes based on
                the product type and the specifications stated in each supplied title; they are
                not presented as hands-on laboratory findings. Live price, stock, bundle contents,
                warranty and seller details should be confirmed on the destination page.
              </p>
              <div className="source-listing-note">
                <strong>{sourceProducts.length} of {sourceProducts.length} source entries shown</strong>
                <span>Original order preserved</span>
                <span>Exact ASIN visible on every card</span>
                <span>Real listing image on every card</span>
                <span>Pros, cons and buyer-fit guidance included</span>
              </div>
              <div className="source-product-grid">
                {sourceProducts.map((product) => (
                  <SourceProductCard product={product} key={product.asin} />
                ))}
              </div>
            </section>
          )}

          {moreProducts.length > 0 && (
            <section id="more-products">
              <span className="eyebrow">More relevant products</span>
              <h2>{moreProducts.length} alternatives worth comparing before you decide</h2>
              <p>
                The detailed picks above are the clearest starting points for this exact
                question. These additional models widen the shortlist for a different
                budget, vessel format, batch size or storage constraint. Every card still
                includes a fit boundary and explicit pros and cons, so a larger product
                list does not become an unfiltered shopping feed.
              </p>
              <div className="option-grid">
                {moreProducts.map((product, index) => (
                  <ProductOptionCard
                    product={product}
                    label={`Alternative ${index + 1}`}
                    key={product.id}
                  />
                ))}
              </div>
            </section>
          )}

          <section id="how-to-choose">
            <span className="eyebrow">{isEditorial ? "Core principles" : "How to choose"}</span>
            <h2>{isEditorial ? "The technique behind a repeatable result" : "The criteria that matter for this exact question"}</h2>
            <p>
              {isEditorial
                ? "Use these principles as the non-negotiable foundation, then adjust time, seasoning or cleaning depth to the food, residue and exact appliance manual."
                : "Product pages often present every function at the same visual weight. A useful buying process does the opposite: it identifies the few variables that control the result, then treats the rest as tie-breakers. Use these criteria in order and stop comparing any model that fails a non-negotiable."}
            </p>
            <div className="criteria-grid">
              {guide.criteria.map((criterion, index) => (
                <article className="criterion-card" key={criterion.title}>
                  <span className="eyebrow">Criterion 0{index + 1}</span>
                  <h3>{criterion.title}</h3>
                  <p>{criterion.body}</p>
                </article>
              ))}
            </div>
          </section>

          {!isEditorial && <BuyerFoundations category={guide.category} />}

          <section id="decision-rules">
            <span className="eyebrow">Simple {isEditorial ? "working" : "decision"} rules</span>
            <h2>{isEditorial ? "Use these shortcuts while you cook or clean." : "Use these shortcuts after measuring your space."}</h2>
            <p>
              {isEditorial
                ? "These shortcuts keep the workflow repeatable without pretending every air fryer, ingredient or residue behaves identically. When a rule conflicts with the manufacturer manual or food-safety guidance, the official guidance wins."
                : "These rules deliberately reduce choice. They are not universal laws; they are a practical way to move from a crowded search page to two or three plausible models. When a rule conflicts with the manufacturer manual or a safety requirement, the official guidance wins."}
            </p>
            <ul className="decision-list">
              {guide.decisionRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </section>

          <section id="mistakes">
            <span className="eyebrow">Common {isEditorial ? "process" : "buying"} mistakes</span>
            <h2>{isEditorial ? "Small errors that change the final result" : "What makes a good product the wrong purchase"}</h2>
            <p>
              {isEditorial
                ? "Most failed results come from moisture, crowding, unsafe shortcuts or treating a generic timer as more authoritative than the food and exact appliance. Correct the process before adding more heat or harsher cleaning tools."
                : "Most regret comes from a mismatch between the appliance and the routine, not from a spectacular product defect. Capacity labels, bundle counts and temporary discounts make that mismatch easy to miss. Avoid these shortcuts and the final comparison becomes much clearer."}
            </p>
            <ul className="mistake-list">
              {guide.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
            </ul>
          </section>

          <section id="method">
            <span className="eyebrow">{isEditorial ? "How this guide was built" : "How we chose"}</span>
            <h2>{isEditorial ? "Practical technique, explicit safety boundaries and model-aware adjustments." : "Source checks first, then real-kitchen fit."}</h2>
            {isEditorial ? (
              <>
                <p>
                  We separated the repeatable principle from the variable setting. Moisture,
                  airflow, food spacing, gentle cleaning and thermometer verification travel
                  across models; exact time, dishwasher eligibility, heating-area access and
                  approved accessories remain model-specific.
                </p>
                <p>
                  The instructions therefore use starting ranges, visual or tactile cues and
                  explicit stop conditions instead of pretending one timer or cleaning hack is
                  universal. Manufacturer manuals take priority for appliance care. USDA guidance
                  is used for poultry and leftover temperature checks.
                </p>
                <p>
                  Product suggestions are included only to explain how basket width, glass,
                  windows or dual zones change the workflow. They are not required to use the
                  recipe or cleaning method, and no marketplace review is presented as hands-on evidence.
                </p>
              </>
            ) : (
              <>
                <p>
                  We began with the exact search topics supplied for this project and the
                  product set already present in the earlier CounterCrave site. We then
                  resolved the useful buying question behind each keyword: household size,
                  container format, hard ingredients, parallel cooking, portability or the
                  need to replace another appliance. That prevents a generic “top products”
                  list from being reused under a different heading.
                </p>
                <p>
                  Core specifications in the shortlist were checked against current
                  manufacturer product or support pages available on the update date. We do
                  not convert marketplace order, star averages or copied customer comments
                  into hands-on test claims. We also avoid fixed price labels because sales,
                  sellers and bundles change faster than a durable buyer guide should.
                </p>
                <p>
                  The final order favors the model that solves the most common version of the
                  page&apos;s question with the fewest ownership penalties. Alternatives exist for
                  a specific reason—smaller space, larger batch, better texture, two cooking
                  zones, glass contact or lower purchase cost. Every recommendation includes
                  a skip condition so the reader can identify when the runner-up is actually
                  the better personal choice.
                </p>
              </>
            )}
            <div className="editorial-note">
              <strong>Affiliate note:</strong> Some retailer links may earn CounterCrave a
              commission at no extra cost to the buyer. Affiliate eligibility does not
              change the model criteria or remove the explicit tradeoffs. Manufacturer
              source links are provided separately for specification checks.
            </div>
          </section>

          <section id="faq">
            <span className="eyebrow">Frequently asked questions</span>
            <h2>{isEditorial ? "Short answers before you start" : "Short answers before you buy"}</h2>
            <div className="faq-list">
              {guide.faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="article-callout">
            <span className="eyebrow eyebrow-light">{isEditorial ? "Ready to use the guide?" : "Ready to narrow it down?"}</span>
            <h2>{isEditorial ? "Follow the principle first. Adjust the exact setting second." : "Choose the format first. Check the current offer second."}</h2>
            <p>
              {isEditorial
                ? "Return to the relevant steps, keep the basket comfortably loaded and let the food, residue and exact manual decide when the process is complete."
                : "Revisit the visual best-pick cards, select the model whose fit sounds like your normal week, and confirm the current dimensions, included parts and warranty before purchase."}
            </p>
            <div className="button-row">
              <a href={guide.contentSections?.[0] ? `#${guide.contentSections[0].id}` : "#comparison"} className="button button-light">
                {isEditorial ? "Back to the guide" : "Back to best picks"}
              </a>
              <Link href="/#finder" className="button">Use the match finder</Link>
            </div>
          </div>

          <section id="related">
            <span className="eyebrow">Related long-form guides</span>
            <h2>Keep the next comparison specific.</h2>
            <div className="related-guides">
              {related.map((item) => <GuideCard guide={item} compact key={item.slug} />)}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}

function productsForGuide(
  slug: string,
  category: "air-fryers" | "blenders",
) {
  const intentSets: Record<string, string[]> = {
    "best-air-fryer-for-one-person": [
      "ninja-af101", "ninja-af141", "ninja-crispi", "cosori-turboblaze",
      "instant-vortex-plus", "beautiful-6qt", "cuisinart-air200",
    ],
    "best-air-fryer-for-two-people": [
      "ninja-af141", "cosori-turboblaze", "instant-vortex-plus", "ninja-af101",
      "ninja-crispi", "cuisinart-air200", "typhur-dome", "beautiful-6qt",
    ],
    "best-glass-air-fryer": [
      "ninja-crispi", "instant-vortex-plus", "cuisinart-air200",
      "instant-vortex-dual", "cosori-turboblaze", "typhur-dome",
    ],
    "best-5-quart-air-fryer": [
      "ninja-af141", "typhur-dome", "cosori-turboblaze", "instant-vortex-plus",
      "cuisinart-air200", "ninja-af101", "beautiful-6qt",
    ],
    "best-large-air-fryer": [
      "ninja-dz401", "ninja-dz550", "ninja-doublestack", "instant-vortex-dual",
      "chefman-turbofry-8qt", "gourmia-gaf826", "cosori-turboblaze",
      "beautiful-6qt", "dreo-chefmaker",
    ],
    "best-air-fryer-for-beginners": [
      "ninja-af141", "cosori-turboblaze", "ninja-af101", "instant-vortex-plus",
      "beautiful-6qt", "chefman-turbofry-8qt", "cuisinart-air200",
    ],
    "best-inexpensive-blender": [
      "hamilton-power-elite", "hamilton-personal-51101", "oster-pro-1200",
      "ninja-bl610", "nutribullet-pro", "ninja-bn701", "cuisinart-smart-stick",
      "nutribullet-portable", "beast-b10", "magic-bullet", "nutribullet-ultra",
    ],
    "best-small-blender-for-smoothies": [
      "nutribullet-pro", "hamilton-personal-51101", "beast-b10",
      "nutribullet-portable", "ninja-blast-max", "nutribullet-flip",
      "oster-pro-1200", "vitamix-e310", "magic-bullet", "nutribullet-ultra",
    ],
    "best-portable-blenders-for-smoothies": [
      "nutribullet-portable", "ninja-blast-max", "nutribullet-flip",
      "hamilton-personal-51101", "nutribullet-pro", "beast-b10",
    ],
    "best-immersion-blenders-for-soups-and-sauces": [
      "braun-multiquick-7", "kitchenaid-khbv53", "breville-control-grip",
      "cuisinart-smart-stick", "vitamix-immersion", "all-clad-immersion",
    ],
    "best-affordable-blender": [
      "hamilton-power-elite", "oster-pro-1200", "ninja-bl610", "nutribullet-pro",
      "ninja-bn701", "hamilton-personal-51101", "cuisinart-smart-stick",
      "nutribullet-portable", "beast-b10", "vitamix-e310", "magic-bullet",
    ],
    "best-blender-for-smoothies-and-ice": [
      "ninja-bn701", "vitamix-5200", "breville-super-q", "vitamix-e310",
      "ninja-tb401", "ninja-ss401", "ninja-bl610", "kitchenaid-k400",
      "ninja-bn801", "oster-pro-1200", "beast-b10",
    ],
    "best-blender-for-fruit-smoothies": [
      "nutribullet-pro", "ninja-bn701", "vitamix-e310", "oster-pro-1200",
      "kitchenaid-k400", "beast-b10", "nutribullet-portable",
      "hamilton-power-elite", "ninja-blast-max", "vitamix-5200",
      "nutribullet-ultra",
    ],
    "best-blenders-for-protein-shakes": [
      "nutribullet-pro", "beast-b10", "hamilton-personal-51101",
      "nutribullet-portable", "ninja-blast-max", "nutribullet-flip",
      "oster-pro-1200", "vitamix-e310", "ninja-bn701", "magic-bullet",
      "nutribullet-ultra",
    ],
    "best-blender-food-processor-combo": [
      "ninja-tb401", "ninja-ss401", "ninja-bn801", "braun-multiquick-7",
      "oster-pro-1200", "breville-control-grip", "vitamix-immersion",
    ],
  };

  const ids = intentSets[slug];
  if (!ids) return products.filter((product) => product.category === category);
  return ids.flatMap((id) => {
    const product = getProduct(id);
    return product && product.category === category ? [product] : [];
  });
}

function BuyerFoundations({ category }: { category: "air-fryers" | "blenders" }) {
  if (category === "air-fryers") {
    return (
      <section id="buyers-guide">
        <span className="eyebrow">Complete air fryer buyer guide</span>
        <h2>Capacity, airflow and ownership in plain language</h2>
        <h3>Basket geometry controls crisping more than the volume headline</h3>
        <p>
          Air frying is a surface-area process. Hot air must reach the food, carry away
          moisture and keep moving around the basket. That is why a wide square drawer can
          outperform a taller basket with the same advertised quarts for wings, vegetables,
          fish fillets and reheated pizza. When food overlaps heavily, the appliance still
          cooks it, but contact points steam and stay pale. A larger volume does not fix a
          narrow floor. Map the pieces you cook to one layer and treat extra depth as useful
          mainly for foods whose shape can use it safely.
        </p>
        <h3>Household size is only the beginning of capacity</h3>
        <p>
          Two households of two people may need different machines. One cooks exactly two
          portions; the other makes lunch for tomorrow. One shares the same main and side;
          the other needs separate temperatures. A broad five- or six-quart basket is the
          strongest default because it handles most two-person meals and modest leftovers
          without the width of dual drawers. Large dual-zone models earn their footprint
          when they repeatedly remove a batch or timing conflict. Buy around the normal
          week, not the largest party you might host once.
        </p>
        <h3>Counter fit includes heat, steam and the open drawer</h3>
        <p>
          Record the appliance width, depth and height, then add the drawer travel and a
          heat-safe place to rest the basket. Follow the manual&apos;s ventilation clearance and
          electrical guidance; do not assume an empty space under a cabinet is automatically
          an operating space. Large handles can extend well beyond the cooking chamber, and
          stacked models exchange counter width for height. The safest and most convenient
          location is a stable surface near a suitable outlet where hot food can move to a
          plate without crossing a busy walkway.
        </p>
        <h3>Cleaning should be evaluated before the first cook</h3>
        <p>
          Remove the crisper plate in your mind before buying: are the tabs easy to grip,
          can a sponge reach the corners, and does a window introduce a grease-catching seam?
          Dishwasher-safe parts are helpful only when your dishwasher has space and the
          manual permits the exact component. Hand washing can preserve some nonstick
          surfaces, but the official care instructions take priority. An appliance that is
          easy to reset after dinner is far more likely to remain useful than one with an
          impressive mode you avoid because cleanup is tedious.
        </p>
      </section>
    );
  }

  return (
    <section id="buyers-guide">
      <span className="eyebrow">Complete blender buyer guide</span>
      <h2>Container, circulation and recipe load explained</h2>
      <h3>The container format decides the daily routine</h3>
      <p>
        A personal cup keeps a small batch close to the blade and often becomes the
        drinking vessel. A full-size pitcher creates enough room for a family batch but can
        need more ingredients to circulate properly. An immersion blender brings the blade
        to a pot and avoids transferring hot soup. A processor combo adds chopping and dough
        by changing the bowl and blade. These are different systems, not size variants of
        one product. Choose the workflow first, then compare motors within it.
      </p>
      <h3>The hardest weekly ingredient sets the performance requirement</h3>
      <p>
        Banana, yogurt and protein powder are easy. Frozen mango, ice, dates, fibrous kale,
        berry seeds and nut butter load a blender in different ways. Peak wattage alone
        cannot predict the result because jar taper, blade reach, speed control and motor
        response determine whether ingredients circulate or form a stationary pocket. Use
        the toughest recipe made every week as the requirement. Do not pay premium prices
        for a smoothie bowl made twice a year, and do not underbuy for frozen fruit used
        every morning.
      </p>
      <h3>Ingredient order is part of the machine</h3>
      <p>
        Pitcher recipes often start with liquid near the blades, followed by soft ingredients
        and frozen items. Inverted personal cups may be loaded in a different order before
        being flipped onto the base. Powder can stick to a dry wall, and oversized frozen
        pieces can bridge above the cutting path. Follow the exact model&apos;s guide and maximum
        fill line. If a blend stalls, stop and unplug the machine before using the approved
        method to redistribute ingredients; never improvise near exposed blades.
      </p>
      <h3>Hot liquids and cleanup need explicit instructions</h3>
      <p>
        A sealed personal cup should never receive hot liquid unless the manual explicitly
        says the system is designed for it; steam can build pressure. Some full-size blenders
        use vented lids, while immersion blenders are intended for in-pot work with their own
        temperature and depth limits. After cold blending, rinse promptly so protein, fruit
        fiber and nut butter do not dry under threads or seals. Detach and wash only the parts
        named in the manual, and keep the motor base and electrical connections dry.
      </p>
    </section>
  );
}
