"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FinderResult = {
  label: string;
  product: string;
  reason: string;
  guide: string;
};

const fallback: FinderResult = {
  label: "Best all-round starting point",
  product: "COSORI TurboBlaze 6-Qt",
  reason: "A broad six-quart basket balances useful capacity, counter space and simple cleanup.",
  guide: "/guides/best-air-fryers-2026",
};

export function KitchenFinder() {
  const [household, setHousehold] = useState("2");
  const [task, setTask] = useState("air-fry");
  const [space, setSpace] = useState("medium");

  const result = useMemo<FinderResult>(() => {
    if (task === "smoothie") {
      if (household === "1") {
        return {
          label: "Best personal smoothie fit",
          product: "nutribullet Pro 900",
          reason: "One cup handles blending, drinking and quick cleanup without a family-size pitcher.",
          guide: "/guides/best-small-blender-for-smoothies",
        };
      }
      return {
        label: "Best family smoothie value",
        product: "Ninja Professional Plus BN701",
        reason: "The large pitcher and crushing system suit multi-serving fruit and frozen-drink batches.",
        guide: "/guides/best-blender-for-smoothies",
      };
    }
    if (task === "soup") {
      return {
        label: "Best in-pot cooking fit",
        product: "Braun MultiQuick 7",
        reason: "The immersion format avoids transferring hot soup and offers controlled texture for sauces.",
        guide: "/guides/best-immersion-blenders-for-soups-and-sauces",
      };
    }
    if (task === "prep") {
      return {
        label: "Best multi-tool kitchen system",
        product: "Ninja BN801 Kitchen System",
        reason: "It combines a pitcher, personal cups and an eight-cup processor bowl on one motor base.",
        guide: "/guides/best-blender-food-processor-combo",
      };
    }
    if (task === "two-foods" && space !== "tight") {
      return {
        label: "Best for two foods at once",
        product: "Ninja DZ401 DualZone XL",
        reason: "Two independent baskets can cook a main and side differently and finish them together.",
        guide: "/guides/best-large-air-fryer",
      };
    }
    if (household === "1" || space === "tight") {
      return {
        label: "Best compact air fryer fit",
        product: "Ninja Air Fryer Pro AF141",
        reason: "Five quarts gives one or two people useful meal space without a wide dual-basket body.",
        guide: "/guides/best-air-fryer-for-one-person",
      };
    }
    return fallback;
  }, [household, task, space]);

  return (
    <div className="finder-grid">
      <div className="finder-form" aria-label="Kitchen product finder">
        <label>
          Household size
          <select value={household} onChange={(event) => setHousehold(event.target.value)}>
            <option value="1">One person</option>
            <option value="2">Two people</option>
            <option value="3+">Three or more</option>
          </select>
        </label>
        <label>
          Main job
          <select value={task} onChange={(event) => setTask(event.target.value)}>
            <option value="air-fry">Quick crisp meals</option>
            <option value="two-foods">Two foods at once</option>
            <option value="smoothie">Smoothies and shakes</option>
            <option value="soup">Soups and sauces</option>
            <option value="prep">Blending plus food prep</option>
          </select>
        </label>
        <label>
          Counter space
          <select value={space} onChange={(event) => setSpace(event.target.value)}>
            <option value="tight">Very tight</option>
            <option value="medium">Average</option>
            <option value="roomy">Roomy</option>
          </select>
        </label>
      </div>
      <div className="finder-result" aria-live="polite">
        <span className="eyebrow">{result.label}</span>
        <h3>{result.product}</h3>
        <p>{result.reason}</p>
        <Link href={result.guide} className="button">
          See why it fits
        </Link>
        <small>Answer changes instantly as you update the three choices.</small>
      </div>
    </div>
  );
}

