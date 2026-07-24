import Link from "next/link";
import type { ContentPage } from "@/types/content";

type RelatedContentProps = {
  pages: ContentPage[];
};

export function RelatedContent({ pages }: RelatedContentProps) {
  if (!pages.length) return null;

  return (
    <section aria-labelledby="related-content">
      <h2 id="related-content">Related content</h2>
      <div className="card-grid">
        {pages.map((page) => (
          <article className="content-card" key={page.pageId}>
            <span className="eyebrow">
              {page.priority} · {page.pageType}
            </span>
            <h3>
              <Link href={`/${page.slug}/`}>{page.title}</Link>
            </h3>
            <p>{page.description}</p>
            {page.draft ? <span className="draft-badge">Local draft</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
