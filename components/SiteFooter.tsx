import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>CounterCrave</strong>
          <p>Independent countertop kitchen appliance research.</p>
          <p className="small">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <ul>
            <li><Link href="/about/">About</Link></li>
            <li><Link href="/how-we-test/">How we test</Link></li>
            <li><Link href="/editorial-policy/">Editorial policy</Link></li>
            <li><Link href="/affiliate-disclosure/">Affiliate disclosure</Link></li>
            <li><Link href="/privacy/">Privacy</Link></li>
            <li><Link href="/terms/">Terms</Link></li>
            <li><Link href="/contact/">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
