import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "./JsonLd";

const guides = [
  {
    href: "/guides/easy-30-minute-dinner-ideas",
    title: "18 Easy 30-Minute Dinners",
    eyebrow: "Interactive collection",
    description: "Complete quantities, three-part methods, filters, swaps and doneness cues—not a gallery of links.",
    image: "/images/recipes/30-minute-dinners-4x3.webp",
    alt: "Five colorful quick dinners arranged on a pale wood table",
    stat: "18 full recipes",
  },
  {
    href: "/guides/crispy-roast-potatoes-recipe",
    title: "Crispy Roast Potatoes",
    eyebrow: "Texture-first method",
    description: "A weighed, baking-soda parboil method for rugged golden edges and properly fluffy centers.",
    image: "/images/recipes/crispy-roast-potatoes-4x3.webp",
    alt: "Extra-crispy roast potato chunks on a green enamel tray",
    stat: "8 visual steps",
  },
  {
    href: "/guides/prime-rib-recipe",
    title: "Reverse-Sear Prime Rib",
    eyebrow: "Temperature-first guide",
    description: "Dry-brining, probe placement, honest timing ranges, a high-heat finish and clear federal safety context.",
    image: "/images/recipes/prime-rib-4x3.webp",
    alt: "Herb-crusted prime rib with evenly rosy carved slices",
    stat: "Timing + temp map",
  },
  {
    href: "/guides/no-bake-cheesecake-recipe",
    title: "No-Bake Cheesecake",
    eyebrow: "Structure without gelatin",
    description: "Exact weights, medium-peak cream, a clean-fold method and the chill schedule for neat slices.",
    image: "/images/recipes/no-bake-cheesecake-4x3.webp",
    alt: "Tall no-bake cheesecake with a smooth cream filling and golden crumb crust",
    stat: "12 clean slices",
  },
  {
    href: "/guides/fluffy-buttermilk-pancake-recipe",
    title: "Fluffy Buttermilk Pancakes",
    eyebrow: "Griddle calibration",
    description: "A tender, high-rise batter with gram weights, surface-temperature guidance and visible flip cues.",
    image: "/images/recipes/fluffy-buttermilk-pancakes-4x3.webp",
    alt: "Golden buttermilk pancake stack showing a tall airy interior",
    stat: "350–375°F griddle",
  },
] as const;

export function RecipeHub() {
  const canonical = "https://countercrave.com/recipes";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        name: "CounterCrave Recipes",
        description: "Technique-first recipes with exact quantities, step photography, visual doneness cues, troubleshooting and cited safety guidance.",
        url: canonical,
        image: "https://countercrave.com/images/recipes/og-countercrave-recipes.webp",
        dateModified: "2026-08-26",
        publisher: { "@type": "Organization", name: "CounterCrave", url: "https://countercrave.com" },
      },
      {
        "@type": "ItemList",
        name: "CounterCrave recipe guides",
        numberOfItems: guides.length,
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: guide.title,
          url: `https://countercrave.com${guide.href}`,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <main id="main-content">
        <section className="hub-hero">
          <div className="shell hub-hero-grid">
            <div>
              <span className="eyebrow eyebrow-accent">CounterCrave Recipe Lab</span>
              <h1>Cook by the cue, not by hope.</h1>
              <p>
                Five original, cookable guides turn technique into visible checkpoints: exact
                quantities, real timing, scalable ingredient lists, diagnostic fixes and food-safety
                sources where they matter.
              </p>
              <div className="button-row">
                <Link className="button" href="/guides/easy-30-minute-dinner-ideas">Choose tonight’s dinner</Link>
                <a className="text-link" href="#recipe-guides">Explore every guide ↓</a>
              </div>
              <dl className="hub-stats">
                <div><dt>22</dt><dd>complete recipes</dd></div>
                <div><dt>15</dt><dd>original graphics</dd></div>
                <div><dt>0</dt><dd>fabricated ratings</dd></div>
              </dl>
            </div>
            <figure className="hub-hero-art">
              <Image src="/images/recipes/og-countercrave-recipes.webp" alt="CounterCrave recipe collection with potatoes, prime rib, cheesecake, pancakes and salmon" width={1200} height={630} priority />
              <figcaption><span>Visual method library</span><strong>Built for the home kitchen</strong></figcaption>
            </figure>
          </div>
        </section>

        <section className="shell hub-intro" aria-labelledby="recipe-guides">
          <div className="section-kicker">
            <span className="eyebrow">The new recipe library</span>
            <h2 id="recipe-guides">Start with the result you want</h2>
            <p>Every page answers the quick question first, then gives enough detail to repeat the result.</p>
          </div>
          <div className="hub-card-grid">
            {guides.map((guide, index) => (
              <Link className={`hub-card ${index === 0 ? "hub-card-featured" : ""}`} href={guide.href} key={guide.href}>
                <figure><Image src={guide.image} alt={guide.alt} width={1200} height={900} priority={index < 2} /></figure>
                <div className="hub-card-copy">
                  <div className="hub-card-meta"><span>{guide.eyebrow}</span><strong>{guide.stat}</strong></div>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <span className="card-link">Open the complete guide <b>→</b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="hub-method">
          <div className="shell hub-method-grid">
            <div className="section-kicker">
              <span className="eyebrow eyebrow-light">Why these pages are useful</span>
              <h2>Evidence where it counts. Sensory judgment where the food demands it.</h2>
            </div>
            <div className="hub-method-list">
              <article><span>01</span><div><h3>Measured formulas</h3><p>Weights sit beside useful volume measures, and the serving scaler never pretends that pan size or cook time scales automatically.</p></div></article>
              <article><span>02</span><div><h3>Visible endpoints</h3><p>Each critical step states what to see, feel or measure, so oven and ingredient variation do not ruin the finish.</p></div></article>
              <article><span>03</span><div><h3>Failure diagnosis</h3><p>Troubleshooting tables connect the symptom to the likely cause and the smallest next-batch correction.</p></div></article>
              <article><span>04</span><div><h3>Transparent publishing</h3><p>Official safety sources are linked, genuine ratings are never invented and structured data matches what readers can see.</p></div></article>
            </div>
          </div>
        </section>

        <section className="shell hub-cta">
          <div>
            <span className="eyebrow">Need dinner first?</span>
            <h2>Filter 18 complete recipes by pan, protein or appetite.</h2>
          </div>
          <Link className="button button-light" href="/guides/easy-30-minute-dinner-ideas">Open the dinner explorer</Link>
        </section>
      </main>
    </>
  );
}
