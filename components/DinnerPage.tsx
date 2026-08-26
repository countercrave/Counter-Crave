import Link from "next/link";
import Image from "next/image";
import { dinnerFaqs, dinnerIdeas, dinnerSources } from "@/content/dinners";
import { DinnerExplorer } from "./DinnerExplorer";
import { JsonLd } from "./JsonLd";

const canonical = "https://countercrave.com/guides/easy-30-minute-dinner-ideas";

function recipeSchema() {
  const recipes = dinnerIdeas.map((idea) => ({
    "@type": "Recipe",
    "@id": `${canonical}#${idea.id}`,
    name: idea.title,
    description: `${idea.whyFast} Complete ${idea.minutes}-minute dinner for ${idea.servings}.`,
    image: `https://countercrave.com${idea.image}`,
    author: { "@type": "Organization", name: "CounterCrave Editorial" },
    datePublished: "2026-08-26",
    dateModified: "2026-08-26",
    prepTime: `PT${idea.activeMinutes}M`,
    cookTime: `PT${Math.max(1, idea.minutes - idea.activeMinutes)}M`,
    totalTime: `PT${idea.minutes}M`,
    recipeYield: `${idea.servings} servings`,
    recipeCategory: "Dinner",
    keywords: `30-minute dinner, ${idea.category}, ${idea.diet}`,
    recipeIngredient: idea.ingredients,
    recipeInstructions: idea.method.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.text,
      url: `${canonical}#${idea.id}`,
    })),
    mainEntityOfPage: `${canonical}#${idea.id}`,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        name: "18 Easy 30-Minute Dinner Ideas: Complete Recipes, One Smart Plan",
        description:
          "Eighteen complete 30-minute dinner recipes with ingredients, visual finish cues, filters, swaps, one-pan options and official food-safety links.",
        url: canonical,
        image: [
          "https://countercrave.com/images/recipes/30-minute-dinners-square.webp",
          "https://countercrave.com/images/recipes/30-minute-dinners-4x3.webp",
          "https://countercrave.com/images/recipes/30-minute-dinners-hero.webp",
        ],
        datePublished: "2026-08-26",
        dateModified: "2026-08-26",
        author: { "@type": "Organization", name: "CounterCrave Editorial" },
        publisher: { "@type": "Organization", name: "CounterCrave" },
        citation: dinnerSources.map((source) => source.url),
      },
      {
        "@type": "ItemList",
        name: "18 complete 30-minute dinner recipes",
        numberOfItems: dinnerIdeas.length,
        itemListElement: dinnerIdeas.map((idea, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${canonical}#${idea.id}`,
          item: { "@id": `${canonical}#${idea.id}` },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://countercrave.com" },
          { "@type": "ListItem", position: 2, name: "Recipes", item: "https://countercrave.com/recipes" },
          { "@type": "ListItem", position: 3, name: "30-Minute Dinners", item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: dinnerFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      ...recipes,
    ],
  };
}

export function DinnerPage() {
  return (
    <>
      <JsonLd data={recipeSchema()} />
      <main id="main-content">
        <header className="article-hero dinner-hero">
          <div className="shell article-hero-grid">
            <div className="article-hero-copy">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href="/recipes">Recipes</Link><span>/</span><span>Dinner</span>
              </nav>
              <span className="eyebrow eyebrow-accent">A real 30-minute dinner system</span>
              <h1>18 Easy 30-Minute Dinner Ideas: Complete Recipes, One Smart Plan</h1>
              <p className="article-dek">
                Not a gallery of links: every dinner includes quantities, three clear moves, a
                doneness cue, a useful swap and the cookware you will wash.
              </p>
              <ul className="article-meta" aria-label="Article details">
                <li>Updated August 26, 2026</li>
                <li>26 min read</li>
                <li>18 complete recipes</li>
              </ul>
              <div className="author-line">
                <span className="author-avatar" aria-hidden="true">CC</span>
                <span><strong>CounterCrave Editorial</strong><br />Decision-first recipes · cited safety guidance</span>
              </div>
            </div>
            <figure className="article-hero-media">
              <div className="photo-frame photo-frame-hero">
                <Image
                  src="/images/recipes/30-minute-dinners-hero.webp"
                  alt="Five colorful 30-minute dinners including chicken, pasta, tacos, salmon rice and chickpea curry"
                  width={1600}
                  height={900}
                  priority
                />
              </div>
              <figcaption>
                <span className="award-sticker">Filter by pan, protein or appetite</span>
                <strong>15–25 minutes each</strong>
              </figcaption>
            </figure>
          </div>
        </header>

        <div className="article-jumpbar" aria-label="Article navigation">
          <div className="shell article-jumpbar-inner">
            <strong>Jump to</strong>
            <nav>
              <a href="#quick-answer">Quick answer</a>
              <a href="#decision-table">Choose fast</a>
              <a href="#recipes">18 recipes</a>
              <a href="#speed-system">Speed system</a>
              <a href="#pantry">Pantry plan</a>
              <a href="#safety">Safety</a>
              <a href="#faq">FAQ</a>
              <a href="#sources">Sources</a>
            </nav>
          </div>
        </div>

        <div className="article-shell article-shell-wide">
          <article className="article-content">
            <section className="verdict-box" id="quick-answer">
              <span className="eyebrow">Quick answer</span>
              <h2>Start the slowest passive task first, cut food small enough to finish on schedule, and use one concentrated flavor plus one fresh finish.</h2>
              <p>
                Microwave rice, canned beans, refrigerated pasta, bagged slaw and prewashed greens
                are not cheats; they move time from repetitive prep into browning and seasoning.
                The 18 options below state total time, active time and cookware separately.
              </p>
              <div className="verdict-links">
                <a href="#recipes"><span>1</span>Search all 18</a>
                <a href="#decision-table"><span>2</span>Compare cleanup</a>
                <a href="#pantry"><span>3</span>Stock the system</a>
              </div>
            </section>
            <div className="article-prose">
              <p>
                Search results for easy dinner ideas often provide a promising picture and send you
                somewhere else for the quantities. This page keeps the decision and the cooking in
                one place. It includes chicken, seafood, vegetarian, vegan, pantry and one-pan
                choices without pretending that every household wants the same meal.
              </p>
              <p>
                The time claims assume ordinary home-kitchen speed and ingredients in the form
                listed. Read the short method before starting, preheat while you measure and use the
                visual or thermometer endpoint—not a race against the final minute.
              </p>
            </div>

            <section className="editorial-section" id="decision-table">
              <span className="eyebrow">Choose in 30 seconds</span>
              <h2>Match tonight’s constraint before choosing the dish</h2>
              <div className="table-scroll" tabIndex={0} aria-label="Quick dinner comparison">
                <table className="diagnostic-table decision-table">
                  <thead><tr><th>If tonight needs…</th><th>Start here</th><th>Why</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">One pan</th><td><a href="#egg-roll-in-a-bowl">Ginger turkey egg roll bowl</a></td><td>Bagged slaw removes most chopping.</td></tr>
                    <tr><th scope="row">No stove</th><td><a href="#mediterranean-chickpea-bowls">Mediterranean chickpea bowls</a></td><td>Drain, chop, dress and assemble.</td></tr>
                    <tr><th scope="row">15 minutes</th><td><a href="#pesto-gnocchi-peas">Pesto gnocchi with peas</a></td><td>One pot and a no-cook sauce.</td></tr>
                    <tr><th scope="row">High protein</th><td><a href="#lemon-garlic-chicken-cutlets">Lemon-garlic chicken cutlets</a></td><td>Thin cutlets cook evenly and quickly.</td></tr>
                    <tr><th scope="row">Vegetarian comfort</th><td><a href="#creamy-tomato-tortellini">Creamy tomato tortellini</a></td><td>Refrigerated pasta cooks in the sauce.</td></tr>
                    <tr><th scope="row">Pantry dinner</th><td><a href="#tuna-lemon-caper-pasta">Tuna lemon-caper pasta</a></td><td>Only lemon and parsley are fresh.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </article>

          <DinnerExplorer ideas={dinnerIdeas} />

          <article className="article-content post-explorer">
            <section className="editorial-section" id="speed-system">
              <span className="eyebrow">The 30-minute system</span>
              <h2>Five moves that protect the deadline and the food</h2>
              <ol className="step-grid">
                <li><span>1</span><div><h3>Read the whole short method</h3><p>Find the passive step, final acid and safety endpoint before turning on heat.</p></div></li>
                <li><span>2</span><div><h3>Start water, oven or rice first</h3><p>The longest passive task should run while you chop and mix a sauce.</p></div></li>
                <li><span>3</span><div><h3>Cut for equal cooking speed</h3><p>Thin cutlets, small florets and even strips finish together and make thermometer checks meaningful.</p></div></li>
                <li><span>4</span><div><h3>Keep the pan hot enough to brown</h3><p>Cook protein in batches when a crowded pan would release water and turn a sear into a simmer.</p></div></li>
                <li><span>5</span><div><h3>Finish off heat</h3><p>Lemon, lime, vinegar, herbs, sesame oil and fresh cheese stay clearer when added after harsh heat.</p></div></li>
              </ol>
            </section>

            <section className="editorial-section" id="pantry">
              <span className="eyebrow">Flexible pantry</span>
              <h2>Stock combinations, not eighteen unrelated shopping lists</h2>
              <div className="pantry-grid">
                <article><h3>Fast foundations</h3><p>Microwave rice, refrigerated tortellini, shelf-stable gnocchi, noodles, tortillas and pita.</p></article>
                <article><h3>Ready proteins</h3><p>Canned beans, canned tuna, eggs, extra-firm tofu, cooked sausage and frozen shelled edamame.</p></article>
                <article><h3>Concentrated flavor</h3><p>Tomato paste, miso, pesto, soy sauce, curry powder, Dijon, Parmesan and capers.</p></article>
                <article><h3>Fresh finish</h3><p>Lemons, limes, scallions, parsley, cilantro, baby greens and a crisp vegetable.</p></article>
              </div>
              <div className="master-list">
                <h3>One useful mixed-cart starter</h3>
                <p>
                  Buy chicken cutlets, salmon, eggs, extra-firm tofu, two cans each of chickpeas and
                  white beans, rice, tortillas, gnocchi, one refrigerated pasta, spinach, broccoli,
                  peppers, onions, cucumber, tomatoes, lemons, limes, garlic, ginger, yogurt,
                  Parmesan, feta, coconut milk, crushed tomatoes, soy sauce and pesto. That set can
                  cover at least eight recipes here with strategic leftovers.
                </p>
              </div>
            </section>

            <section className="editorial-section" id="safety">
              <span className="eyebrow">Food-safety checkpoints</span>
              <h2>Fast cooking still needs a measured finish</h2>
              <div className="temperature-grid">
                <article><strong>165°F</strong><span>Poultry & leftovers</span></article>
                <article><strong>160°F</strong><span>Ground meat & egg dishes</span></article>
                <article><strong>145°F</strong><span>Fish; whole beef/pork + 3-min rest</span></article>
                <article><strong>Opaque</strong><span>Shrimp, lobster, crab & scallops</span></article>
              </div>
              <div className="safety-note">
                <strong>Use the coolest center</strong>
                <span>
                  Insert the thermometer into the thickest part without touching bone or the pan.
                  Refrigerate cooked food promptly and reheat leftovers to 165°F.
                </span>
                <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart">
                  Check the USDA chart →
                </a>
              </div>
            </section>

            <section className="editorial-section" id="faq">
              <span className="eyebrow">Questions</span>
              <h2>Short answers for a faster weeknight</h2>
              <div className="faq-list">
                {dinnerFaqs.map((faq, index) => (
                  <details key={faq.question} open={index === 0}>
                    <summary>{faq.question}</summary><p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="editorial-section" id="sources">
              <span className="eyebrow">Sources & implementation</span>
              <h2>Official references behind the safety and schema details</h2>
              <ul className="source-list">
                {dinnerSources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
                    <p>{source.note}</p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="method-note">
              <strong>Editorial note.</strong> The recipes use realistic convenience ingredients
              where they materially protect the 30-minute promise. No fabricated ratings appear in
              the markup. Cook time remains an estimate; visual and thermometer cues are the endpoint.
            </aside>

            <div className="article-callout">
              <span className="eyebrow eyebrow-light">Dinner solved</span>
              <h2>Filter by tonight’s constraint, open one method and keep the rest for another week.</h2>
              <div className="button-row">
                <a href="#recipes" className="button button-light">Choose a dinner</a>
                <a href="#pantry" className="button">Build the pantry</a>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
