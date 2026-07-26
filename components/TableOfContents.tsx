"use client";

import { useEffect, useState } from "react";
import { headingId } from "@/lib/headings";
import type { PageSection } from "@/types/content";

type TableOfContentsProps = {
  sections: PageSection[];
  hasProducts: boolean;
  hasFaqs: boolean;
  hasMorePicks?: boolean;
};

/**
 * Image-4 style TOC: numbered list, active left bar, scrolls when long.
 */
export function TableOfContents({
  sections,
  hasProducts,
  hasFaqs,
  hasMorePicks = false,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const visibleSections = sections.filter((section) => section.level !== 3);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -65% 0px" },
    );

    const ids = [
      ...(hasProducts
        ? ["top-picks", "comparison-table", "recommended-picks"]
        : []),
      ...visibleSections.map((s) => headingId(s.heading)),
      ...(hasMorePicks ? ["more-picks"] : []),
      ...(hasFaqs ? ["frequently-asked-questions"] : []),
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visibleSections, hasProducts, hasFaqs, hasMorePicks]);

  return (
    <nav className="toc sticky-toc" aria-label="On this page">
      <div className="toc-header">
        <strong>On this page</strong>
      </div>
      <ol>
        {hasProducts ? (
          <>
            <li className={activeId === "top-picks" ? "active" : ""}>
              <a href="#top-picks">Top picks</a>
            </li>
            <li className={activeId === "comparison-table" ? "active" : ""}>
              <a href="#comparison-table">Comparison table</a>
            </li>
            <li className={activeId === "recommended-picks" ? "active" : ""}>
              <a href="#recommended-picks">Detailed reviews</a>
            </li>
          </>
        ) : null}
        {visibleSections.map((section) => {
          const id = headingId(section.heading);
          return (
            <li key={section.heading} className={activeId === id ? "active" : ""}>
              <a href={`#${id}`}>{section.heading}</a>
            </li>
          );
        })}
        {hasMorePicks ? (
          <li className={activeId === "more-picks" ? "active" : ""}>
            <a href="#more-picks">More picks</a>
          </li>
        ) : null}
        {hasFaqs ? (
          <li className={activeId === "frequently-asked-questions" ? "active" : ""}>
            <a href="#frequently-asked-questions">FAQs</a>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
