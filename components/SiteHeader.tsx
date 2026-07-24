import Link from "next/link";
import { canShowContentPlan } from "@/lib/content";

export function SiteHeader() {
  const showPlan = canShowContentPlan();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="CounterCrave home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>
            <strong>CounterCrave</strong>
            <small>Honest kitchen gear picks</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            <li><Link href="/about/">About</Link></li>
            <li><Link href="/how-we-test/">How we test</Link></li>
            <li><Link href="/affiliate-disclosure/">Disclosure</Link></li>
            {showPlan ? <li><Link href="/content-plan/">Content plan</Link></li> : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}
