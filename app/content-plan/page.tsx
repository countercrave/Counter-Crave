import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  canShowContentPlan,
  getAllPages,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Local content plan",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentPlanPage() {
  if (!canShowContentPlan()) notFound();

  const pages = getAllPages({ includeDrafts: true }).filter(
    (page) => page.cluster !== "Trust" && page.cluster !== "Legal",
  );

  return (
    <main className="container main-content">
      <header className="article-header">
        <span className="eyebrow">Local development only</span>
        <h1>CounterCrave content plan</h1>
        <p className="dek">
          These editorial briefs are not indexed in production. Complete the
          original content, add verified products, pass QA and set draft to
          false before publishing.
        </p>
      </header>

      <div className="table-wrapper">
        <table>
          <caption>{pages.length} planned pages</caption>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Cluster</th>
              <th>Page type</th>
              <th>Title</th>
              <th>Keyword</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.pageId}>
                <td>{page.priority}</td>
                <td>{page.cluster}</td>
                <td>{page.pageType}</td>
                <td>
                  <Link href={`/${page.slug}/`}>{page.title}</Link>
                </td>
                <td>{page.primaryKeyword}</td>
                <td>{page.draft ? "Draft brief" : "Published"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
