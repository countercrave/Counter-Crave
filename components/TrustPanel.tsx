import Link from "next/link";
import type { ContentPage } from "@/types/content";

type TrustPanelProps = {
  page: ContentPage;
};

export function TrustPanel({ page }: TrustPanelProps) {
  return (
    <aside className="trust-panel" aria-label="Why trust this guide">
      <div>
        <span className="trust-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Why trust this guide</strong>
          <p>
            Recommendations are based on verified specifications, explicit
            decision criteria and documented trade-offs—not commission alone.
          </p>
        </div>
      </div>
      <dl>
        <div>
          <dt>Method</dt>
          <dd><Link href="/how-we-test/">See how we evaluate products</Link></dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{page.evidenceRequirement || "Verified research and original analysis"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{page.updatedAt || "Before publication"}</dd>
        </div>
      </dl>
    </aside>
  );
}
