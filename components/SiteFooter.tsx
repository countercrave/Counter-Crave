import Link from "next/link";
import { categoryHubs } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <strong>CounterCrave</strong>
          <p>
            Clean, practical buying guides for countertop kitchen appliances —
            clear trade-offs, disclosed Amazon links, and use-case fit first.
          </p>
          <p className="small">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>

        <nav aria-label="Shop by category">
          <strong>Categories</strong>
          <ul>
            {categoryHubs.map((category) => (
              <li key={category.slug}>
                <Link href={`/${category.slug}/`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Top money guides">
          <strong>Popular guides</strong>
          <ul>
            <li>
              <Link href="/best-air-fryers/">Best air fryers</Link>
            </li>
            <li>
              <Link href="/best-air-fryer-under-100/">Air fryers under $100</Link>
            </li>
            <li>
              <Link href="/ninja-vs-cosori-air-fryer/">Ninja vs Cosori</Link>
            </li>
            <li>
              <Link href="/best-blenders/">Best blenders</Link>
            </li>
            <li>
              <Link href="/best-blender-under-100/">Blenders under $100</Link>
            </li>
            <li>
              <Link href="/air-fryer-buying-guide/">Air fryer buying guide</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Trust and legal">
          <strong>Trust &amp; legal</strong>
          <ul>
            <li>
              <Link href="/search/">Search guides</Link>
            </li>
            <li>
              <Link href="/how-we-test/">How we test</Link>
            </li>
            <li>
              <Link href="/editorial-policy/">Editorial policy</Link>
            </li>
            <li>
              <Link href="/about/">About</Link>
            </li>
            <li>
              <Link href="/affiliate-disclosure/">Affiliate disclosure</Link>
            </li>
            <li>
              <Link href="/privacy/">Privacy</Link>
            </li>
            <li>
              <Link href="/terms/">Terms</Link>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CounterCrave</span>
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </div>
    </footer>
  );
}
