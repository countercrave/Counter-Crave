import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCards } from "@/components/ProductCards";
import { RelatedContent } from "@/components/RelatedContent";
import { getProductsForPage } from "@/lib/products";
import type { ContentPage } from "@/types/content";

type PageRendererProps = {
  page: ContentPage;
  relatedPages: ContentPage[];
};

const affiliateTypes = new Set([
  "Commercial Pillar",
  "Roundup",
  "Accessory Roundup",
  "Single Review",
  "Comparison",
]);

export function PageRenderer({
  page,
  relatedPages,
}: PageRendererProps) {
  const products = getProductsForPage(page.pageId);
  const showDisclosure =
    affiliateTypes.has(page.pageType) || products.length > 0;

  return (
    <main className="container main-content">
      <Breadcrumbs title={page.title} />

      <article className="article">
        {page.draft ? (
          <aside className="draft-notice">
            <strong>Local editorial draft:</strong> this URL is excluded from
            production, robots and the sitemap until the JSON file has complete
            original content and <code>draft</code> is changed to{" "}
            <code>false</code>.
          </aside>
        ) : null}

        {showDisclosure ? <AffiliateDisclosure /> : null}

        <header className="article-header">
          <span className="eyebrow">
            {page.cluster} · {page.pageType} · {page.priority}
          </span>
          <h1>{page.title}</h1>
          <p className="dek">{page.description}</p>

          <div className="article-meta">
            <span>By {page.author || "CounterCrave Editorial Team"}</span>
            {page.updatedAt ? <span>Updated {page.updatedAt}</span> : null}
            {page.primaryKeyword ? (
              <span>Topic: {page.primaryKeyword}</span>
            ) : null}
          </div>
        </header>

        {page.summary ? (
          <section className="answer-box" aria-label="Quick answer">
            <strong>Quick answer</strong>
            <p>{page.summary}</p>
          </section>
        ) : page.draft && page.answerBlockBrief ? (
          <section className="brief-box" aria-label="Answer block brief">
            <strong>Answer-first brief</strong>
            <p>{page.answerBlockBrief}</p>
          </section>
        ) : null}

        {page.draft ? (
          <section className="brief-metadata" aria-labelledby="editorial-brief">
            <h2 id="editorial-brief">Editorial brief</h2>
            <dl>
              <div><dt>Search intent</dt><dd>{page.searchIntent || "—"}</dd></div>
              <div><dt>Target length</dt><dd>{page.targetLength || "—"}</dd></div>
              <div><dt>Required tables</dt><dd>{page.requiredTables || "—"}</dd></div>
              <div><dt>CTA guidance</dt><dd>{page.ctaGuidance || "—"}</dd></div>
              <div><dt>Evidence</dt><dd>{page.evidenceRequirement || "—"}</dd></div>
            </dl>
          </section>
        ) : null}

        {(page.sections || []).map((section, index) => {
          const Heading = section.level === 3 ? "h3" : "h2";
          const hasContent =
            Boolean(section.paragraphs?.length) ||
            Boolean(section.bullets?.length);

          return (
            <section key={`${section.heading}-${index}`}>
              <Heading>{section.heading}</Heading>

              {hasContent ? (
                <>
                  {(section.paragraphs || []).map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}

                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : page.draft ? (
                <div className="section-brief">
                  <strong>Writer instruction</strong>
                  <p>{section.brief}</p>
                </div>
              ) : null}
            </section>
          );
        })}

        <ProductCards pageId={page.pageId} products={products} />

        {page.faqs?.length ? (
          <section aria-labelledby="frequently-asked-questions">
            <h2 id="frequently-asked-questions">
              Frequently asked questions
            </h2>
            <div className="faq-list">
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <RelatedContent pages={relatedPages} />
    </main>
  );
}
