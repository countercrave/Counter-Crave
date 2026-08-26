"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { dinnerCategories, type DinnerIdea } from "@/content/dinners";

const categoryMeta: Record<
  string,
  { image: string; alt: string; caption: string; tag: string; description: string }
> = {
  Skillet: {
    image: "/images/recipes/30-minute-dinners-skillet.webp",
    alt: "Three 30-minute skillet dinners with chicken cutlets, ground turkey zucchini, and crisp sausage gnocchi",
    caption: "1 Skillet • High-Heat Stovetop Browning",
    tag: "Skillet Dinners",
    description: "Fast-cooking cutlets, ground poultry, and shelf-stable gnocchi crisped directly in one pan.",
  },
  "Pasta & noodles": {
    image: "/images/recipes/30-minute-dinners-pasta.webp",
    alt: "Fast pasta and noodle dinners including parmesan garlic shells, chili crisp peanut noodles, and lemon ricotta pasta",
    caption: "Fast-Boil Pastas & Emulsified Sauces",
    tag: "Pasta & Noodle Dinners",
    description: "Short shapes and quick noodles cooked in parallel with high-flavor pan sauces.",
  },
  Bowls: {
    image: "/images/recipes/30-minute-dinners-bowls.webp",
    alt: "Quick grain and rice bowls including ginger soy salmon and spicy chipotle black bean bowls",
    caption: "Steamed Grains & Seared Proteins",
    tag: "Grain & Rice Bowls",
    description: "Speed-steamed grains combined with high-heat seared fish, chicken, or seasoned beans.",
  },
  "Tacos & wraps": {
    image: "/images/recipes/30-minute-dinners-tacos.webp",
    alt: "Fast taco and wrap dinners including blackened fish tacos and sheet pan chicken fajitas",
    caption: "Sheet Pan Roasts & Stovetop Folds",
    tag: "Tacos & Wraps",
    description: "High-heat skillet fish, sheet-pan fajita strips, and quick-sauced wraps.",
  },
  Meatless: {
    image: "/images/recipes/30-minute-dinners-meatless.webp",
    alt: "High-protein vegetarian 30-minute meals including coconut chickpea curry and crispy sesame tofu",
    caption: "Plant-Powered High Protein Dinners",
    tag: "Meatless Dinners",
    description: "Chickpeas, extra-firm tofu, and rich coconut-based curries ready in 25 minutes or less.",
  },
};

function DinnerCard({ idea, defaultOpen = false }: { idea: DinnerIdea; defaultOpen?: boolean }) {
  return (
    <article className="dinner-card" id={idea.id} key={idea.id}>
      <div className="dinner-card-body">
        <div className="dinner-title-row">
          <div>
            <div className="dinner-badge-row">
              <span className="category-pill">{idea.category}</span>
              <span className="brand-line">{idea.diet}</span>
            </div>
            <h3>{idea.title}</h3>
          </div>
          <div className="time-badge">
            <strong>{idea.minutes}</strong>
            <span>min</span>
          </div>
        </div>
        <ul className="spec-strip" aria-label={`${idea.title} details`}>
          <li>{idea.cookware}</li>
          <li>{idea.activeMinutes} min active</li>
          <li>Serves {idea.servings}</li>
        </ul>
        <p className="why-fast">
          <strong>Why it fits:</strong> {idea.whyFast}
        </p>
        <details className="mini-recipe" open={defaultOpen}>
          <summary>Open ingredients &amp; method</summary>
          <div className="mini-recipe-grid">
            <div>
              <h4>Ingredients</h4>
              <ul>
                {idea.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Three-part method</h4>
              <ol>
                {idea.method.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}:</strong> {step.text}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p className="finish-cue">
            <strong>Finish cue:</strong> {idea.finishCue}
          </p>
          <p className="swap-note">
            <strong>Useful swap:</strong> {idea.swap}
          </p>
          {idea.safety && (
            <p className="card-safety">
              <strong>Safety:</strong> {idea.safety}
            </p>
          )}
        </details>
      </div>
    </article>
  );
}

export function DinnerExplorer({ ideas }: { ideas: DinnerIdea[] }) {
  const [category, setCategory] = useState<(typeof dinnerCategories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ideas.filter((idea) => {
      const categoryMatch = category === "All" || idea.category === category;
      const queryMatch =
        !needle ||
        [idea.title, idea.category, idea.diet, ...idea.ingredients]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return categoryMatch && queryMatch;
    });
  }, [category, ideas, query]);

  // Group by category when viewing All without active search query
  const groupedCategories = useMemo(() => {
    if (category !== "All" || query.trim()) return null;
    const cats = ["Skillet", "Pasta & noodles", "Bowls", "Tacos & wraps", "Meatless"] as const;
    return cats.map((cat) => ({
      name: cat,
      meta: categoryMeta[cat],
      recipes: ideas.filter((idea) => idea.category === cat),
    }));
  }, [category, ideas, query]);

  return (
    <section className="dinner-explorer" id="recipes" aria-labelledby="recipes-heading">
      <div className="explorer-heading">
        <div>
          <span className="eyebrow">18 complete mini-recipes</span>
          <h2 id="recipes-heading">Choose by the pan you want to wash</h2>
          <p>Every result includes quantities, a three-part method, a finish cue and a useful swap.</p>
        </div>
        <label className="search-field">
          <span>Search ingredients or diet</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try chickpeas, chicken, vegetarian…"
          />
        </label>
      </div>
      <div className="filter-tabs" role="group" aria-label="Filter dinner recipes">
        {dinnerCategories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">
        Showing <strong>{filtered.length}</strong> of {ideas.length} dinners
      </p>

      {/* Render grouped sections when viewing all categories without search query */}
      {groupedCategories ? (
        <div className="dinner-grouped-view">
          {groupedCategories.map((group) => (
            <section key={group.name} className="dinner-category-group">
              {group.meta && (
                <figure className="category-group-banner">
                  <Image
                    src={group.meta.image}
                    alt={group.meta.alt}
                    width={1400}
                    height={788}
                    priority={group.name === "Skillet"}
                  />
                  <figcaption>
                    <span>{group.meta.tag}</span>
                    <strong>{group.meta.caption}</strong>
                  </figcaption>
                </figure>
              )}
              <div className="category-group-header">
                <h3>{group.name} Recipes</h3>
                <p>{group.meta?.description}</p>
              </div>
              <div className="dinner-list">
                {group.recipes.map((idea, index) => (
                  <DinnerCard key={idea.id} idea={idea} defaultOpen={index === 0} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="dinner-filtered-view">
          {/* If a single category is filtered and no search query, show its full banner */}
          {category !== "All" && !query.trim() && categoryMeta[category] && (
            <figure className="category-group-banner">
              <Image
                src={categoryMeta[category].image}
                alt={categoryMeta[category].alt}
                width={1400}
                height={788}
                priority
              />
              <figcaption>
                <span>{categoryMeta[category].tag}</span>
                <strong>{categoryMeta[category].caption}</strong>
              </figcaption>
            </figure>
          )}
          <div className="dinner-list">
            {filtered.map((idea, index) => (
              <DinnerCard key={idea.id} idea={idea} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No exact match yet</h3>
          <p>Clear the search or choose All to see every complete recipe.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Show all dinners
          </button>
        </div>
      )}
    </section>
  );
}
