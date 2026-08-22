import Link from "next/link";

const primaryLinks = [
  { href: "/categories/air-fryers", label: "Air Fryers" },
  { href: "/categories/blenders", label: "Blenders" },
  { href: "/guides", label: "Buying Guides" },
  { href: "/#finder", label: "Find My Match" },
];

export function SiteHeader() {
  return (
    <>
      <div className="trust-strip">
        <div className="shell trust-strip-inner">
          <span>Independent, decision-first kitchen guidance</span>
          <span className="trust-strip-detail">No invented reviews · Specs checked at source</span>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand" aria-label="CounterCrave home">
            <span className="brand-mark" aria-hidden="true">CC</span>
            <span className="brand-copy">
              <strong>CounterCrave</strong>
              <small>Kitchen buying guides</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/guides/best-air-fryers-2026" className="button button-small header-cta">
            See top picks
          </Link>
          <details className="mobile-nav">
            <summary aria-label="Open navigation">Menu</summary>
            <div className="mobile-nav-panel">
              {primaryLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link href="/about">How we choose</Link>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Link href="/" className="brand brand-light">
            <span className="brand-mark" aria-hidden="true">CC</span>
            <span className="brand-copy">
              <strong>CounterCrave</strong>
              <small>Kitchen buying guides</small>
            </span>
          </Link>
          <p>
            Clear appliance recommendations built around portions, counter space,
            cleanup and the food you actually make.
          </p>
        </div>
        <div>
          <h2>Shop by task</h2>
          <Link href="/categories/air-fryers">Air fryers</Link>
          <Link href="/categories/blenders">Blenders</Link>
          <Link href="/categories/food-processors">Food processors</Link>
          <Link href="/categories/toaster-ovens">Toaster ovens</Link>
        </div>
        <div>
          <h2>Useful guides</h2>
          <Link href="/guides/best-air-fryer-for-one-person">For one person</Link>
          <Link href="/guides/best-small-blender-for-smoothies">Small blenders</Link>
          <Link href="/guides/best-blender-food-processor-combo">Blender combos</Link>
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
        <p>© 2026 CounterCrave. Product details and availability can change; verify the current listing and manual before purchase.</p>
        <p>As an Amazon Associate, CounterCrave may earn from qualifying purchases.</p>
      </div>
    </footer>
  );
}

