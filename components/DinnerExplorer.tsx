"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { dinnerCategories, type DinnerIdea } from "@/content/dinners";

export function DinnerExplorer({ ideas }: { ideas: DinnerIdea[] }) {
  const [category, setCategory] = useState<(typeof dinnerCategories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ideas.filter((idea) => {
      const categoryMatch = category === "All" || idea.category === category;
      const queryMatch = !needle || [idea.title, idea.category, idea.diet, ...idea.ingredients]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      return categoryMatch && queryMatch;
    });
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
      {filtered.length ? (
        <div className="dinner-list">
          {filtered.map((idea, index) => (
            <article className="dinner-card" id={idea.id} key={idea.id}>
              <figure className="dinner-card-media">
                <Image src={idea.image} alt={idea.imageAlt} width={1400} height={1050} priority={index < 2} />
                <span>{idea.category}</span>
              </figure>
              <div className="dinner-card-body">
                <div className="dinner-title-row">
                  <div>
                    <span className="brand-line">{idea.diet}</span>
                    <h3>{idea.title}</h3>
                  </div>
                  <div className="time-badge"><strong>{idea.minutes}</strong><span>min</span></div>
                </div>
                <ul className="spec-strip" aria-label={`${idea.title} details`}>
                  <li>{idea.cookware}</li>
                  <li>{idea.activeMinutes} min active</li>
                  <li>Serves {idea.servings}</li>
                </ul>
                <p className="why-fast"><strong>Why it fits:</strong> {idea.whyFast}</p>
                <details className="mini-recipe" open={index === 0}>
                  <summary>Open ingredients & method</summary>
                  <div className="mini-recipe-grid">
                    <div>
                      <h4>Ingredients</h4>
                      <ul>{idea.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <h4>Three-part method</h4>
                      <ol>
                        {idea.method.map((step) => <li key={step.title}><strong>{step.title}:</strong> {step.text}</li>)}
                      </ol>
                    </div>
                  </div>
                  <p className="finish-cue"><strong>Finish cue:</strong> {idea.finishCue}</p>
                  <p className="swap-note"><strong>Useful swap:</strong> {idea.swap}</p>
                  {idea.safety && <p className="card-safety"><strong>Safety:</strong> {idea.safety}</p>}
                </details>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No exact match yet</h3>
          <p>Clear the search or choose All to see every complete recipe.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Show all dinners</button>
        </div>
      )}
    </section>
  );
}
