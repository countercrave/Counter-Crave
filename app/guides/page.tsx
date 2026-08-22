import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard } from "../components/GuideCard";
import { guides } from "../data/guide-data";
import { categories } from "../data/site-data";

export const metadata: Metadata = {
  title: "Kitchen Appliance Buying Guides",
  description:
    "Long-form kitchen guides for air fryers, blenders, coffee makers, rice cookers, vacuum sealers, wine coolers and pizza ovens, each with Amazon-backed picks and clear buyer-fit advice.",
};

const sectionCopy: Record<string, { title: string; description: string }> = {
  "air-fryers": {
    title: "Choose basket size and format before features.",
    description: "Product comparisons, a crispy-tofu recipe, a safe cleaning routine and practical cooking ideas, all built around usable area and airflow.",
  },
  blenders: {
    title: "Match the jar and power system to the recipe.",
    description: "Personal smoothies, frozen fruit, protein shakes, portable models, immersion blenders and full blender-processor systems.",
  },
  "coffee-makers": {
    title: "Choose the brewing method before the machine.",
    description: "Single-serve, pod, espresso, drip, grind-and-brew, compact and stovetop guides built around the cup you repeat.",
  },
  "rice-cookers": {
    title: "Size the cooker around your normal uncooked batch.",
    description: "Compact cooker comparisons focused on minimum batch, grain programs, pot care and keep-warm quality.",
  },
  "vacuum-sealers": {
    title: "Choose the bag system before the pump claim.",
    description: "Countertop and handheld sealing guidance for freezer prep, sous vide, leftovers and safe storage routines.",
  },
  "wine-coolers": {
    title: "Choose cooling type and venting before bottle count.",
    description: "Built-in, freestanding and countertop wine and beverage fridges for kitchens that run warm.",
  },
  "pizza-ovens": {
    title: "Buy for the crust you want and the outlet you have.",
    description: "Indoor electric, rotating and outdoor pizza ovens compared by temperature, stone and power draw.",
  },
};

export default function GuidesPage() {
  const sections = categories.map((category) => ({
    ...category,
    copy: sectionCopy[category.slug],
    guides: guides.filter((guide) => guide.category === category.slug),
  }));
  const newGuides = guides.filter((guide) => guide.isNew);
  const lead = guides.find((guide) => guide.slug === "best-air-fryers-2026");

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">{guides.length} kitchen guides</span>
            <h1>Kitchen advice that takes you from “best” to “best for me.”</h1>
            <p>
              Every guide opens with a direct recommendation, shows three Amazon-backed picks with a reason to
              skip each one, then compares the rest of the field.
            </p>
            <div className="filter-nav" aria-label="Guide categories">
              {sections.map((section) => (
                <a href={`#${section.slug}`} key={section.slug}>{section.shortName} ({section.guides.length})</a>
              ))}
            </div>
          </div>
          {lead && (
            <figure className="page-hero-media">
              <div className="plate plate-xl">
                <img src={lead.image} alt={lead.imageAlt} fetchPriority="high" decoding="async" referrerPolicy="no-referrer" />
              </div>
              <figcaption>Every pick links to a real Amazon listing with a real product photo.</figcaption>
            </figure>
          )}
        </div>
      </section>

      {newGuides.length > 0 && (
        <section className="section section-flush" id="new">
          <div className="shell">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="eyebrow">Just published</span>
                <h2>New this week</h2>
              </div>
            </div>
            <div className="guide-grid guide-grid-three">
              {newGuides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
            </div>
          </div>
        </section>
      )}

      {sections.map((section, index) => (
        <section className={`section${index % 2 ? "" : " section-tint"}`} id={section.slug} key={section.slug}>
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{section.name}</span>
                <h2>{section.copy.title}</h2>
              </div>
              <p>{section.copy.description} <Link href={`/categories/${section.slug}`} className="text-link">Open the {section.shortName.toLowerCase()} hub <span aria-hidden="true">→</span></Link></p>
            </div>
            <div className="guide-grid guide-grid-three">
              {section.guides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
