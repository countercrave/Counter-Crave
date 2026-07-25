import Link from "next/link";
import { categoryHubs } from "@/lib/categories";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="CounterCrave home">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            <strong>CounterCrave</strong>
            <small>Smart kitchen buying guides</small>
          </span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            <li className="nav-item has-mega">
              <button type="button" className="nav-trigger" aria-expanded="false">
                Categories
              </button>
              <div className="mega-menu" role="menu">
                {categoryHubs.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/${category.slug}/`}
                    role="menuitem"
                  >
                    <strong>{category.name}</strong>
                    <span>{category.description}</span>
                  </Link>
                ))}
              </div>
            </li>
            <li>
              <Link href="/best-air-fryers/">Best air fryers</Link>
            </li>
            <li>
              <Link href="/best-blenders/">Best blenders</Link>
            </li>
            <li>
              <Link href="/how-we-test/">How we test</Link>
            </li>
            <li>
              <Link href="/about/">About</Link>
            </li>
          </ul>
        </nav>

        <Link className="header-cta" href="/affiliate-disclosure/">
          Disclosure
        </Link>
      </div>

      <div className="category-bar" aria-label="All categories">
        <div className="container category-bar-inner">
          {categoryHubs.map((category) => (
            <Link key={category.slug} href={`/${category.slug}/`}>
              {category.short}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
