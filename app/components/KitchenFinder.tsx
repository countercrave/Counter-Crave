"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type FinderProduct = {
  name: string;
  image: string;
  buyUrl: string;
};

type FinderResult = {
  label: string;
  productKey: string;
  reason: string;
  guide: string;
};

const fallback: FinderResult = {
  label: "Best all-round starting point",
  productKey: "cosori-turboblaze",
  reason: "A broad six-quart basket balances useful capacity, counter space and simple cleanup.",
  guide: "/guides/best-air-fryers-2026",
};

export function KitchenFinder({ products }: { products: Record<string, FinderProduct> }) {
  const [household, setHousehold] = useState("2");
  const [task, setTask] = useState("air-fry");
  const [space, setSpace] = useState("medium");

  const result = useMemo<FinderResult>(() => {
    if (task === "single-coffee") {
      return {
        label: household === "1" ? "Best quick one-cup fit" : "Best flexible single-serve fit",
        productKey: "keurig-k-express",
        reason: "A compact pod brewer keeps the morning fast, and three cup sizes cover two people who like different drinks.",
        guide: "/guides/best-single-serve-coffee-maker",
      };
    }
    if (task === "espresso") {
      return {
        label: "Best approachable home-espresso fit",
        productKey: "espresso",
        reason: "A pump machine gives hands-on control over espresso and milk drinks without a café-size footprint.",
        guide: "/guides/best-home-espresso-machines",
      };
    }
    if (task === "rice") {
      return {
        label: "Best compact rice-cooker fit",
        productKey: "toshiba-rice",
        reason: "A three-cup pot suits everyday one-to-three-cup batches and adds grain programs without a family-size footprint.",
        guide: "/guides/best-small-rice-cooker",
      };
    }
    if (task === "seal") {
      return {
        label: "Best all-round food-storage fit",
        productKey: "nesco-vs12",
        reason: "A countertop sealer with adjustable modes handles freezer portions, batch prep and delicate foods.",
        guide: "/guides/best-vacuum-sealer",
      };
    }
    if (task === "pizza") {
      return {
        label: space === "tight" ? "Best compact pizza-night fit" : "Best pizza oven for most homes",
        productKey: space === "tight" ? "presto-pizzazz" : "ninja-artisan",
        reason:
          space === "tight"
            ? "A rotating pizza oven stores flat, needs no preheat and handles frozen and pre-made pizzas well."
            : "700°F stone baking and a three-minute 12-inch pizza cover scratch-made and frozen nights alike.",
        guide: "/guides/best-pizza-oven-for-home",
      };
    }
    if (task === "wine") {
      return {
        label: space === "tight" ? "Best countertop wine cooler" : "Best wine cooler for a kitchen",
        productKey: space === "tight" ? "cuisinart-wine" : "ivation-12",
        reason:
          space === "tight"
            ? "A quiet 8-bottle thermoelectric cooler fits on a counter away from the oven."
            : "Compressor cooling holds cellar temperature in a warm kitchen and twelve bottles covers the week.",
        guide: "/guides/best-wine-cooler-for-the-kitchen",
      };
    }
    if (task === "smoothie") {
      if (household === "1") {
        return {
          label: "Best personal smoothie fit",
          productKey: "nutribullet-pro",
          reason: "One cup handles blending, drinking and quick cleanup without a family-size pitcher.",
          guide: "/guides/best-small-blender-for-smoothies",
        };
      }
      return {
        label: "Best family smoothie value",
        productKey: "ninja-bn701",
        reason: "The large pitcher and crushing blades suit multi-serving fruit and frozen-drink batches.",
        guide: "/guides/best-blender-for-smoothies",
      };
    }
    if (task === "soup") {
      return {
        label: "Best in-pot cooking fit",
        productKey: "braun-multiquick-7",
        reason: "The immersion format avoids transferring hot soup and offers controlled texture for sauces.",
        guide: "/guides/best-immersion-blenders-for-soups-and-sauces",
      };
    }
    if (task === "prep") {
      return {
        label: "Best multi-tool kitchen system",
        productKey: "ninja-bn801",
        reason: "It combines a pitcher, personal cups and an eight-cup processor bowl on one motor base.",
        guide: "/guides/best-blender-food-processor-combo",
      };
    }
    if (task === "two-foods" && space !== "tight") {
      return {
        label: "Best for two foods at once",
        productKey: "ninja-dz401",
        reason: "Two independent baskets cook a main and a side differently and finish them together.",
        guide: "/guides/best-large-air-fryer",
      };
    }
    if (household === "1" || space === "tight") {
      return {
        label: "Best compact air fryer fit",
        productKey: "ninja-af141",
        reason: "Five quarts gives one or two people useful meal space without a wide dual-basket body.",
        guide: "/guides/best-air-fryer-for-one-person",
      };
    }
    return fallback;
  }, [household, task, space]);

  const product = products[result.productKey] ?? products[fallback.productKey];

  return (
    <div className="finder">
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
            <option value="single-coffee">Fast single-cup coffee</option>
            <option value="espresso">Espresso and milk drinks</option>
            <option value="rice">Small-batch rice</option>
            <option value="seal">Freezer and food storage</option>
            <option value="wine">Chilled wine and drinks</option>
            <option value="pizza">Homemade pizza</option>
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
        <small>The result updates as you change the three answers.</small>
      </div>
      <div className="finder-result" aria-live="polite">
        {product && (
          <div className="finder-plate">
            <img src={product.image} alt={product.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className="finder-copy">
          <span className="eyebrow eyebrow-light">{result.label}</span>
          <h3>{product?.name ?? "A good starting point"}</h3>
          <p>{result.reason}</p>
          <div className="button-row">
            <Link href={result.guide} className="button button-light">Read why it fits</Link>
            {product && (
              <a className="buy-button buy-button-small" href={product.buyUrl} target="_blank" rel="sponsored nofollow noopener">
                Buy Now <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
