"use client";

import { useMemo, useState } from "react";
import type { IngredientGroup } from "@/content/types";

const fractionGlyphs: Record<string, string> = {
  "0.25": "¼",
  "0.33": "⅓",
  "0.5": "½",
  "0.67": "⅔",
  "0.75": "¾",
};

function formatAmount(value: number) {
  const rounded = Math.round(value * 12) / 12;
  const whole = Math.floor(rounded);
  const decimal = rounded - whole;
  const key = Object.keys(fractionGlyphs).find((item) => Math.abs(Number(item) - decimal) < 0.025);

  if (!key) return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, "");
  return `${whole ? `${whole} ` : ""}${fractionGlyphs[key]}`;
}

export function RecipeTools({
  ingredientGroups,
  baseServings,
}: {
  ingredientGroups: IngredientGroup[];
  baseServings: number;
}) {
  const [multiplier, setMultiplier] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const servings = useMemo(() => baseServings * multiplier, [baseServings, multiplier]);

  function toggleIngredient(key: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="recipe-card" id="recipe-card">
      <div className="recipe-card-head">
        <div>
          <span className="eyebrow">Cookable recipe</span>
          <h2>Ingredients, scaled to your table</h2>
        </div>
        <div className="recipe-actions">
          <div className="scale-control" aria-label="Scale recipe">
            {[0.5, 1, 2].map((value) => (
              <button
                key={value}
                type="button"
                className={multiplier === value ? "active" : ""}
                onClick={() => setMultiplier(value)}
                aria-pressed={multiplier === value}
              >
                {value}×
              </button>
            ))}
          </div>
          <button className="print-button" type="button" onClick={() => window.print()}>
            Print recipe
          </button>
        </div>
      </div>
      <p className="serving-note">
        Showing quantities for <strong>{servings}</strong> servings. Scaling changes ingredient
        amounts, not pan size or cooking time.
      </p>
      <div className="ingredient-columns">
        {ingredientGroups.map((group) => (
          <section key={group.name} className="ingredient-group">
            <h3>{group.name}</h3>
            <ul>
              {group.ingredients.map((ingredient, index) => {
                const key = `${group.name}-${index}`;
                return (
                  <li key={key} className={checked.has(key) ? "checked" : ""}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked.has(key)}
                        onChange={() => toggleIngredient(key)}
                      />
                      <span>
                        {ingredient.amount !== undefined && (
                          <strong>
                            {formatAmount(ingredient.amount * multiplier)} {ingredient.unit ?? ""}
                          </strong>
                        )}{" "}
                        {ingredient.item}
                        {ingredient.note && <small>{ingredient.note}</small>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
