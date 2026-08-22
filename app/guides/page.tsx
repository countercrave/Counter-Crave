import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard } from "../components/GuideCard";
import { guides } from "../data/guide-data";

export const metadata: Metadata = {
  title: "Kitchen Appliance Buying Guides",
  description:
    "Long-form air fryer and blender guides with exact picks, visual comparison cards, recipes, cleaning help and use-case advice.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  const airFryerGuides = guides.filter((guide) => guide.category === "air-fryers");
  const blenderGuides = guides.filter((guide) => guide.category === "blenders");

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">{guides.length} complete kitchen guides</span>
            <h1>Kitchen advice that takes you from “best” to “best for me.”</h1>
            <p>
              Every article opens with a direct recommendation, then earns it with a
              visual best-pick cards, detailed product guidance, real-life fit checks,
              common mistakes and an intent-specific FAQ.
            </p>
            <div className="filter-nav" aria-label="Guide categories">
              <a href="#air-fryers">Air fryer guides ({airFryerGuides.length})</a>
              <a href="#blenders">Blender guides ({blenderGuides.length})</a>
              <Link href="/#finder">Use the match finder</Link>
            </div>
          </div>
          <div className="page-hero-media">
            <img
              src="https://images.ctfassets.net/gscn32h7ckds/6Qsko0dGXGK8cBtwOhDODa/ed8224bd223523f650ab479f459d87ef/blender_outlet_2_CM.jpg"
              alt="Real blender and fresh ingredients on a kitchen counter"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>Long-form guidance · real products · no copied customer reviews</span>
          </div>
        </div>
      </section>

      <section className="section" id="air-fryers">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Air fryer guides</span>
              <h2>Choose basket size and format before features.</h2>
            </div>
            <p>
              Product comparisons, a crispy-tofu recipe, a safe cleaning routine and
              practical cooking ideas—all built around usable area, airflow and real kitchens.
            </p>
          </div>
          <div className="guide-grid">
            {airFryerGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
        </div>
      </section>

      <section className="section section-tint" id="blenders">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Blender guides</span>
              <h2>Match the jar and power system to the recipe.</h2>
            </div>
            <p>
              Personal smoothies, frozen fruit, protein shakes, portable models,
              immersion blenders and full blender–processor systems.
            </p>
          </div>
          <div className="guide-grid">
            {blenderGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
