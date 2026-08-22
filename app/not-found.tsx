import Link from "next/link";
import { categories } from "./data/site-data";

export default function NotFound() {
  const lead = categories[0];
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">404 · Wrong drawer</span>
            <h1>This kitchen guide is not on the counter.</h1>
            <p>The address may have changed. The guide library and the match finder will get the comparison back on track.</p>
            <div className="button-row">
              <Link href="/guides" className="button">Browse all guides</Link>
              <Link href="/#finder" className="button button-secondary">Use the match finder</Link>
            </div>
          </div>
          <figure className="page-hero-media">
            <div className="plate plate-xl">
              <img src={lead.image} alt={lead.imageAlt} decoding="async" referrerPolicy="no-referrer" />
            </div>
            <figcaption>Try the guide library or start with a product-fit question</figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
