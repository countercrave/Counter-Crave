import Link from "next/link";
import type { Guide } from "../data/guide-data";
import { getSourceProducts } from "../data/source-products";

export function GuideCard({ guide, compact = false }: { guide: Guide; compact?: boolean }) {
  const sourceImage = getSourceProducts(guide.slug)[0]?.image;
  const label = guide.contentType === "recipe"
    ? "Recipe"
    : guide.contentType === "cleaning"
      ? "Cleaning guide"
      : guide.contentType === "ideas"
        ? "Cooking ideas"
        : guide.category === "air-fryers"
          ? "Air fryers"
          : "Blenders";

  return (
    <article className={`guide-card${compact ? " guide-card-compact" : ""}`}>
      <Link href={`/guides/${guide.slug}`} className="guide-card-media" aria-label={guide.title}>
        <img
          src={sourceImage ?? guide.image}
          alt={guide.imageAlt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <span className="guide-card-label">{label}</span>
      </Link>
      <div className="guide-card-body">
        <div className="meta-row">
          <span>{guide.readTime}</span>
          <span>Updated 2026</span>
        </div>
        <h3><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h3>
        <p>{guide.description}</p>
        <Link href={`/guides/${guide.slug}`} className="text-link">
          Read the guide <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
