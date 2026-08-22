import Link from "next/link";

const primaryLinks = [
  { href: "/categories/air-fryers", label: "Air fryers" },
  { href: "/categories/blenders", label: "Blenders" },
  { href: "/categories/coffee-makers", label: "Coffee" },
  { href: "/categories/wine-coolers", label: "Wine coolers" },
  { href: "/categories/pizza-ovens", label: "Pizza ovens" },
  { href: "/guides", label: "All guides" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="CounterCrave home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32" focusable="false">
              <rect x="3" y="9" width="26" height="16" rx="4" fill="currentColor" />
              <rect x="8" y="13" width="16" height="6" rx="2" fill="var(--butter)" />
              <rect x="11" y="5" width="10" height="4" rx="2" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>CounterCrave</strong>
            <small>Kitchen buying guides</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <Link href="/#finder" className="button button-small header-cta">Find my match</Link>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <div className="mobile-nav-panel">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
            <Link href="/categories/rice-cookers">Rice cookers</Link>
            <Link href="/categories/vacuum-sealers">Vacuum sealers</Link>
            <Link href="/#finder">Find my match</Link>
            <Link href="/about">How we choose</Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Link href="/" className="brand brand-light">
            <span className="brand-copy">
              <strong>CounterCrave</strong>
              <small>Kitchen buying guides</small>
            </span>
          </Link>
          <p>
            Clear appliance recommendations built around portions, counter space,
            cleanup and the food you actually make. Every pick links to its Amazon listing.
          </p>
        </div>
        <div>
          <h2>Categories</h2>
          <Link href="/categories/air-fryers">Air fryers</Link>
          <Link href="/categories/blenders">Blenders</Link>
          <Link href="/categories/coffee-makers">Coffee makers</Link>
          <Link href="/categories/rice-cookers">Rice cookers</Link>
          <Link href="/categories/vacuum-sealers">Vacuum sealers</Link>
          <Link href="/categories/wine-coolers">Wine &amp; beverage coolers</Link>
          <Link href="/categories/pizza-ovens">Pizza ovens</Link>
        </div>
        <div>
          <h2>Start here</h2>
          <Link href="/guides/best-air-fryers-2026">Best air fryers 2026</Link>
          <Link href="/guides/best-blender-for-smoothies">Best blender for smoothies</Link>
          <Link href="/guides/best-single-serve-coffee-maker">Best single-serve coffee maker</Link>
          <Link href="/guides/best-pizza-oven-for-home">Best pizza oven for home</Link>
          <Link href="/guides/best-wine-cooler-for-the-kitchen">Best wine cooler for the kitchen</Link>
          <Link href="/guides">All guides</Link>
        </div>
        <div>
          <h2>Trust</h2>
          <Link href="/about">How we choose</Link>
          <Link href="/disclosure">Affiliate disclosure</Link>
          <a href="mailto:hello@countercrave.com">Contact</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© 2026 CounterCrave. Product details and availability change; confirm the current listing and manual before you buy.</p>
        <p>As an Amazon Associate, CounterCrave earns from qualifying purchases.</p>
      </div>
    </footer>
  );
}
