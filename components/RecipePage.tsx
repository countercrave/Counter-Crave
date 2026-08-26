import Link from "next/link";
import Image from "next/image";
import type { RecipeArticle } from "@/content/types";
import { JsonLd } from "./JsonLd";
import { RecipeTools } from "./RecipeTools";

const siteUrl = "https://countercrave.com";

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

function isoDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `PT${hours ? `${hours}H` : ""}${mins ? `${mins}M` : ""}`;
}

function ingredientText(recipe: RecipeArticle) {
  return recipe.ingredientGroups.flatMap((group) =>
    group.ingredients.map((ingredient) =>
      [ingredient.amount, ingredient.unit, ingredient.item, ingredient.note ? `(${ingredient.note})` : ""]
        .filter((part) => part !== undefined && part !== "")
        .join(" "),
    ),
  );
}

function imageSet(hero: string) {
  const root = hero.replace(/-hero\.webp$/, "");
  return [
    `${siteUrl}${root}-square.webp`,
    `${siteUrl}${root}-4x3.webp`,
    `${siteUrl}${hero}`,
  ];
}

export function RecipePage({ recipe }: { recipe: RecipeArticle }) {
  const canonical = `${siteUrl}/guides/${recipe.slug}`;
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes + (recipe.additionalMinutes ?? 0);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Recipe",
        "@id": `${canonical}#recipe`,
        name: recipe.title,
        description: recipe.description,
        image: imageSet(recipe.hero),
        author: { "@type": "Organization", name: "CounterCrave Editorial" },
        publisher: { "@type": "Organization", name: "CounterCrave", url: siteUrl },
        datePublished: recipe.published,
        dateModified: recipe.published,
        prepTime: isoDuration(recipe.prepMinutes),
        cookTime: isoDuration(recipe.cookMinutes),
        totalTime: isoDuration(totalMinutes),
        recipeYield: recipe.recipeYield,
        recipeCategory: recipe.category,
        recipeCuisine: recipe.cuisine,
        keywords: [recipe.targetKeyword, ...recipe.secondaryKeywords].join(", "),
        recipeIngredient: ingredientText(recipe),
        recipeInstructions: recipe.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: `${step.text} Visual cue: ${step.cue}`,
          url: `${canonical}#step-${index + 1}`,
        })),
        mainEntityOfPage: canonical,
        citation: recipe.sources.map((source) => source.url),
      },
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: recipe.title,
        description: recipe.description,
        image: imageSet(recipe.hero),
        datePublished: recipe.published,
        dateModified: recipe.published,
        author: { "@type": "Organization", name: "CounterCrave Editorial" },
        publisher: { "@type": "Organization", name: "CounterCrave", url: siteUrl },
        mainEntityOfPage: canonical,
        about: recipe.targetKeyword,
        citation: recipe.sources.map((source) => source.url),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Recipes", item: `${siteUrl}/recipes` },
          { "@type": "ListItem", position: 3, name: recipe.title, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: recipe.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <main id="main-content">
        <header className="article-hero">
          <div className="shell article-hero-grid">
            <div className="article-hero-copy">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href="/recipes">Recipes</Link>
                <span>/</span>
                <span>{recipe.category}</span>
              </nav>
              <span className="eyebrow eyebrow-accent">{recipe.eyebrow}</span>
              <h1>{recipe.title}</h1>
              <p className="article-dek">{recipe.dek}</p>
              <ul className="article-meta" aria-label="Article details">
                <li>Updated {recipe.updated}</li>
                <li>{recipe.readMinutes} min read</li>
                <li>{recipe.recipeYield}</li>
              </ul>
              <div className="author-line">
                <span className="author-avatar" aria-hidden="true">CC</span>
                <span>
                  <strong>CounterCrave Editorial</strong>
                  <br />Measured method · cited safety guidance
                </span>
              </div>
            </div>
            <figure className="article-hero-media">
              <div className="photo-frame photo-frame-hero">
                <Image src={recipe.hero} alt={recipe.heroAlt} width={1600} height={900} priority />
              </div>
              <figcaption>
                <span className="award-sticker">Visual cues at every critical step</span>
                <strong>{duration(totalMinutes)} total</strong>
              </figcaption>
            </figure>
          </div>
        </header>

        <div className="article-jumpbar" aria-label="Article navigation">
          <div className="shell article-jumpbar-inner">
            <strong>Jump to</strong>
            <nav>
              <a href="#quick-answer">Quick answer</a>
              <a href="#recipe-card">Recipe</a>
              <a href="#ingredient-logic">Why it works</a>
              <a href="#method">Steps</a>
              <a href="#troubleshooting">Fixes</a>
              <a href="#variations">Variations</a>
              <a href="#faq">FAQ</a>
              <a href="#sources">Sources</a>
            </nav>
          </div>
        </div>

        <div className="article-shell">
          <article className="article-content">
            <section className="verdict-box" id="quick-answer">
              <span className="eyebrow">Quick answer</span>
              <h2>{recipe.quickAnswer}</h2>
              <p>{recipe.quickSummary}</p>
              <div className="verdict-links">
                <a href="#recipe-card"><span>1</span>Scale ingredients</a>
                <a href="#method"><span>2</span>Follow visual cues</a>
                <a href="#troubleshooting"><span>3</span>Fix the result</a>
              </div>
            </section>

            <div className="article-prose">
              {recipe.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <section className="recipe-glance" aria-labelledby="glance-heading">
              <span className="eyebrow">At a glance</span>
              <h2 id="glance-heading">Plan the clock before you begin</h2>
              <dl className="glance-grid">
                <div><dt>Prep</dt><dd>{duration(recipe.prepMinutes)}</dd></div>
                <div><dt>Cook</dt><dd>{duration(recipe.cookMinutes)}</dd></div>
                {recipe.additionalMinutes ? (
                  <div><dt>Chill / rest</dt><dd>{duration(recipe.additionalMinutes)}</dd></div>
                ) : (
                  <div><dt>Extra time</dt><dd>None</dd></div>
                )}
                <div><dt>Yield</dt><dd>{recipe.recipeYield}</dd></div>
              </dl>
            </section>

            <RecipeTools ingredientGroups={recipe.ingredientGroups} baseServings={recipe.servings} />

            <section className="editorial-section" id="equipment">
              <span className="eyebrow">Equipment</span>
              <h2>Use the tool that controls the outcome</h2>
              <ul className="bullet-grid">
                {recipe.equipment.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section className="editorial-section" id="ingredient-logic">
              <span className="eyebrow">Ingredient blueprint</span>
              <h2>Why each choice earns its place</h2>
              <div className="criteria-grid">
                {recipe.ingredientLogic.map((item) => (
                  <article className="criterion-card" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="editorial-section" id="method">
              <span className="eyebrow">Step-by-step method</span>
              <h2>Follow the change you can see—not only the timer</h2>
              <figure className="process-figure">
                <Image src={recipe.stepImage} alt={recipe.stepImageAlt} width={1536} height={1024} loading="lazy" />
                <figcaption>
                  The visual sequence is a companion to the detailed cues below; use the exact
                  temperature and safety directions in the text.
                </figcaption>
              </figure>
              <ol className="step-grid step-grid-detailed">
                {recipe.steps.map((step, index) => (
                  <li key={step.title} id={`step-${index + 1}`}>
                    <span>{index + 1}</span>
                    <div>
                      <div className="step-title-row">
                        <h3>{step.title}</h3>
                        {step.time && <small>{step.time}</small>}
                      </div>
                      <p>{step.text}</p>
                      <p className="visual-cue"><strong>Look for:</strong> {step.cue}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="editorial-section" id="principles">
              <span className="eyebrow">Repeatable principles</span>
              <h2>The four controls that matter most</h2>
              <div className="principle-grid principle-grid-two">
                {recipe.principles.map((item, index) => (
                  <article className="principle-card" key={item.title}>
                    <span>{index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            {recipe.safetyNote && (
              <aside className="safety-note">
                <strong>Food-safety baseline</strong>
                <span>{recipe.safetyNote}</span>
                <a href={recipe.sources[0]?.url}>Read the supporting official guidance →</a>
              </aside>
            )}

            <section className="editorial-section" id="troubleshooting">
              <span className="eyebrow">Troubleshooting matrix</span>
              <h2>Diagnose the result before changing the whole recipe</h2>
              <div className="table-scroll" tabIndex={0} aria-label="Troubleshooting table">
                <table className="diagnostic-table">
                  <thead><tr><th>What happened</th><th>Likely cause</th><th>Next-batch fix</th></tr></thead>
                  <tbody>
                    {recipe.diagnostics.map((row) => (
                      <tr key={row.problem}><th scope="row">{row.problem}</th><td>{row.cause}</td><td>{row.fix}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="editorial-section" id="variations">
              <span className="eyebrow">Controlled variations</span>
              <h2>Change the flavor without breaking the method</h2>
              <div className="variation-grid">
                {recipe.variations.map((item) => (
                  <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>
                ))}
              </div>
            </section>

            <section className="editorial-section" id="make-ahead">
              <span className="eyebrow">Make ahead & storage</span>
              <h2>Protect the texture after the main method</h2>
              <ul className="decision-list">
                {recipe.makeAhead.map((item) => <li key={item.title}><strong>{item.title}:</strong> {item.text}</li>)}
              </ul>
            </section>

            <section className="editorial-section" id="faq">
              <span className="eyebrow">Questions</span>
              <h2>Short answers before you start</h2>
              <div className="faq-list">
                {recipe.faqs.map((faq, index) => (
                  <details key={faq.question} open={index === 0}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="editorial-section" id="sources">
              <span className="eyebrow">Sources & review notes</span>
              <h2>What supports the safety and publishing details</h2>
              <ul className="source-list">
                {recipe.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
                    <p>{source.note}</p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="method-note">
              <strong>How this page was built.</strong> CounterCrave separates universal technique
              from equipment-specific timing, publishes visual endpoints and does not display an
              aggregate rating until real reader ratings exist. Safety statements link to the
              responsible public authority. <a href="https://countercrave.com/about">Read the editorial method.</a>
            </aside>

            <div className="article-callout">
              <span className="eyebrow eyebrow-light">Ready to cook?</span>
              <h2>Scale once, read the visual cue, then let the ingredient—not the clock—show you the finish.</h2>
              <div className="button-row">
                <a href="#recipe-card" className="button button-light">Back to ingredients</a>
                <a href="#method" className="button">Start the method</a>
              </div>
            </div>

            <section className="related-section" id="related">
              <span className="eyebrow">Related reading</span>
              <h2>Build the next meal around a specific job</h2>
              <div className="related-grid">
                {recipe.related.map((item) => (
                  item.href.startsWith("/") ? (
                    <Link key={item.href} href={item.href}>{item.label}<span>→</span></Link>
                  ) : (
                    <a key={item.href} href={item.href}>{item.label}<span>→</span></a>
                  )
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
