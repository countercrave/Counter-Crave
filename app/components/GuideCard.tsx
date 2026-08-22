import Link from "next/link";
import type { Guide } from "../data/guide-data";
import { guideLabel, guideLeadImage } from "../data/guide-helpers";

export function GuideCard({ guide, compact = false }: { guide: Guide; compact?: boolean }) {
  const lead = guideLeadImage(guide);
  return (
    <article className={`guide-card${compact ? " guide-card-compact" : ""}`}>
      <Link href={`/guides/${guide.slug}`} className="guide-card-media" aria-label={guide.title}>
        <img src={lead.src} alt={lead.alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        <span className="guide-card-label">{guideLabel(guide)}</span>
        {guide.isNew && <span className="new-badge">New</span>}
      </Link>
      <div className="guide-card-body">
        <h3><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h3>
        {!compact && <p>{guide.description}</p>}
        <div className="guide-card-meta">
          <span>{lead.count ? `${lead.count} models compared` : guide.readTime}</span>
          <Link href={`/guides/${guide.slug}`} className="text-link">Read the guide <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}
