import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "../../components/GuideCard";
import { PickCard } from "../../components/PickCard";
import { ProductCard } from "../../components/ProductCard";
import { getGuide, guides } from "../../data/guide-data";
import {
  categoryNames,
  categorySubjects,
  comparisonListing,
  guideLeadImage,
  pickView,
  readMinutes,
  resolvePicks,
} from "../../data/guide-helpers";
import { getListing } from "../../data/catalog";

type GuidePageProps = { params: Promise<{ slug: string }> };

const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://countercrave.com";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const lead = guideLeadImage(guide);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      images: [{ url: lead.src, alt: lead.alt }],
      modifiedTime: "2026-08-22T00:00:00Z",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [lead.src],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const picks = resolvePicks(guide).map(pickView);
  const listing = getListing(guide.slug);
  const moreModels = comparisonListing(guide);
  const isEditorial = Boolean(guide.contentType && guide.contentType !== "buying");
  const subject = categorySubjects[guide.category];
  const categoryName = categoryNames[guide.category];
  const comparedCount = listing.length;
  const minutes = readMinutes(guide, comparedCount);
  const lead = guideLeadImage(guide);
  const related = guides
    .filter((candidate) => candidate.category === guide.category && candidate.slug !== guide.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: [lead.src],
    dateModified: "2026-08-22",
    datePublished: "2026-08-22",
    author: { "@type": "Organization", name: "CounterCrave Editorial" },
    publisher: { "@type": "Organization", name: "CounterCrave" },
    mainEntityOfPage: `${origin}/guides/${guide.slug}`,
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
  const schemaProducts = [
    ...picks.map((pick) => ({ name: pick.name, image: pick.image, description: pick.reason, url: pick.buyUrl })),
    ...moreModels.map((product) => ({ name: product.title, image: product.image, description: product.fit, url: product.amazonUrl })),
  ];
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${guide.title} product comparison`,
    numberOfItems: schemaProducts.length,
    itemListElement: schemaProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Product", name: product.name, image: product.image, description: product.description, url: product.url },
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
        image: [lead.src],
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
          image: [lead.src],
          description: guide.description,
          totalTime: "PT15M",
          step: cleaningSteps.map((step) => ({ "@type": "HowToStep", name: step.title, text: step.body })),
        }
      : null;
  const schemas = [articleSchema, faqSchema, productListSchema, specialGuideSchema].filter(Boolean);

  return (
    <main id="main-content">
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}

      <header className="article-hero">
        <div className="shell article-hero-grid">
          <div className="article-hero-copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span>/</span>
              <Link href={`/categories/${guide.category}`}>{categoryName}</Link><span>/</span>
              <span>{isEditorial ? "Kitchen how-to" : "Buying guide"}</span>
            </nav>
            <span className="eyebrow eyebrow-accent">{guide.eyebrow}{guide.isNew ? " · New" : ""}</span>
            <h1>{guide.title}</h1>
            <p className="article-dek">{guide.description}</p>
            <ul className="article-meta" aria-label="Article details">
              <li>Updated {guide.updated}</li>
              <li>{minutes} min read</li>
              {comparedCount > 0 && <li>{comparedCount} models compared</li>}
              <li>{picks.length} top picks</li>
            </ul>
            <div className="author-line">
              <span className="author-avatar" aria-hidden="true">CC</span>
              <span><strong>CounterCrave Editorial</strong><br />Product-fit research, not sponsored rankings</span>
            </div>
          </div>
          {picks[0] && (
            <figure className="article-hero-media">
              <div className="plate plate-xl">
                <img src={picks[0].image} alt={picks[0].imageAlt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
              </div>
              <figcaption>
                <span className="award-sticker">{picks[0].award}</span>
                <strong>{picks[0].name}</strong>
              </figcaption>
            </figure>
          )}
        </div>
      </header>

      <div className="article-jumpbar" aria-label="Article navigation">
        <div className="shell article-jumpbar-inner">
          <strong>Jump to</strong>
          <nav>
            <a href="#quick-answer">Quick answer</a>
            {guide.contentSections?.map((section) => <a href={`#${section.id}`} key={section.id}>{section.eyebrow}</a>)}
            <a href="#top-picks">Top picks</a>
            {moreModels.length > 0 && <a href="#all-models">All {comparedCount} models</a>}
            <a href="#how-to-choose">{isEditorial ? "Core principles" : "How to choose"}</a>
            <a href="#decision-rules">Decision rules</a>
            <a href="#mistakes">Mistakes</a>
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
              {picks.map((pick, index) => (
                <a href={`#pick-${index + 1}`} key={pick.key}>
                  <span>{index + 1}</span> {pick.name}
                </a>
              ))}
            </div>
          </section>

          <div className="article-prose">
            {guide.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          {guide.contentSections?.map((section) => (
            <section className="editorial-section" id={section.id} key={section.id}>
              <span className="eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <div className="article-prose">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.steps && (
                <ol className="step-grid">
                  {section.steps.map((step, index) => (
                    <li key={step.title}>
                      <span>{index + 1}</span>
                      <div><h3>{step.title}</h3><p>{step.body}</p></div>
                    </li>
                  ))}
                </ol>
              )}
              {section.bullets && (
                <ul className="bullet-grid">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}

          {(guide.contentType === "ideas" || guide.slug.includes("chicken")) && (
            <div className="safety-note">
              <strong>Food-safety check</strong>
              USDA guidance sets 165°F as the safe minimum for all poultry and for reheated
              leftovers. Measure with a food thermometer; do not rely on color or time alone.
              <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart" target="_blank" rel="noopener">USDA safe-temperature chart</a>
            </div>
          )}

          {guide.slug === "best-vacuum-sealer" && (
            <div className="safety-note">
              <strong>Food-storage safety</strong>
              Vacuum sealing does not make perishable food shelf-stable. Keep food at safe
              refrigerator or freezer temperatures and follow normal storage timelines.
              <a href="https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely" target="_blank" rel="noopener">FDA storage guidance</a>
            </div>
          )}
        </article>

        <section className="article-wide" id="top-picks">
          <div className="section-heading section-heading-tight">
            <div>
              <span className="eyebrow">Top picks</span>
              <h2>{guide.picksHeading ?? `Which ${subject} fits which kitchen?`}</h2>
            </div>
            <p>
              {guide.picksIntro ?? "Each card names the kitchen it suits and the one it does not. Prices are left off on purpose; they change weekly, fit does not."}
            </p>
          </div>
          <div className="pick-grid">
            {picks.map((pick, index) => <PickCard index={index} pick={pick} key={pick.key} />)}
          </div>
        </section>

        {moreModels.length > 0 && (
          <section className="article-wide" id="all-models">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="eyebrow">The rest of the field</span>
                <h2>{moreModels.length} more {subject}s we compared</h2>
              </div>
              <p>
                Listed in the order they appeared in our comparison, with the specs each listing states. Use the
                format line to skip the ones that do not fit, then open only the two or three that do.
              </p>
            </div>
            <div className="product-grid">
              {moreModels.map((product, index) => (
                <ProductCard product={product} index={index} key={product.asin} />
              ))}
            </div>
            <p className="listing-footnote">
              Specs, pros and watch-outs are drawn from each product&apos;s listing and its format; we have not
              lab-tested every model. Confirm price, stock, bundle contents and warranty on Amazon before ordering.
            </p>
          </section>
        )}

        <article className="article-content">
          <section id="how-to-choose">
            <span className="eyebrow">{isEditorial ? "Core principles" : "How to choose"}</span>
            <h2>{isEditorial ? "The technique behind a repeatable result" : `What actually decides the right ${subject}`}</h2>
            <div className="criteria-grid">
              {guide.criteria.map((criterion) => (
                <article className="criterion-card" key={criterion.title}>
                  <h3>{criterion.title}</h3>
                  <p>{criterion.body}</p>
                </article>
              ))}
            </div>
            {!isEditorial && (
              <p className="article-aside">
                Want the longer version? The <Link href={`/categories/${guide.category}#foundation`}>{categoryName.toLowerCase()} hub</Link> covers
                the fundamentals that apply to every model.
              </p>
            )}
          </section>

          <section id="decision-rules">
            <span className="eyebrow">{isEditorial ? "Working rules" : "Decision rules"}</span>
            <h2>{isEditorial ? "Shortcuts to use while you cook or clean" : "Shortcuts to use once you have measured the space"}</h2>
            <ul className="decision-list">
              {guide.decisionRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </section>

          <section id="mistakes">
            <span className="eyebrow">{isEditorial ? "Common process mistakes" : "Common buying mistakes"}</span>
            <h2>{isEditorial ? "Small errors that change the result" : `What makes a good ${subject} the wrong purchase`}</h2>
            <ul className="mistake-list">
              {guide.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
            </ul>
          </section>

          <section id="faq">
            <span className="eyebrow">Questions</span>
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

          <aside className="method-note" id="method">
            <strong>How this guide was built.</strong>{" "}
            {isEditorial
              ? "We separate the repeatable principle from the model-specific setting, use starting ranges and visual cues instead of one universal timer, and defer to the manufacturer manual and USDA guidance for care and safety."
              : `We start from the kitchen job behind the search, remove accessories, consumables and colour duplicates from the Amazon field, then order the ${subject}s by how well each format fits that job with the fewest ownership penalties. Specs come from each listing; we do not convert star ratings or copied reviews into test claims.`}{" "}
            Some links earn CounterCrave a commission at no cost to you; that never changes the order. <Link href="/about">Read the full method</Link> or the <Link href="/disclosure">affiliate disclosure</Link>.
          </aside>

          <div className="article-callout">
            <span className="eyebrow eyebrow-light">{isEditorial ? "Ready to use the guide?" : "Ready to narrow it down?"}</span>
            <h2>{isEditorial ? "Follow the principle first. Adjust the exact setting second." : "Choose the format first. Check the current offer second."}</h2>
            <div className="button-row">
              <a href={guide.contentSections?.[0] ? `#${guide.contentSections[0].id}` : "#top-picks"} className="button button-light">
                {isEditorial ? "Back to the guide" : "Back to the top picks"}
              </a>
              <Link href="/#finder" className="button">Use the match finder</Link>
            </div>
          </div>

          <section id="related">
            <span className="eyebrow">Related guides</span>
            <h2>Keep the next comparison specific.</h2>
            <div className="guide-grid guide-grid-three">
              {related.map((item) => <GuideCard guide={item} compact key={item.slug} />)}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
