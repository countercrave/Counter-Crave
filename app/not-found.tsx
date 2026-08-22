import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <span className="eyebrow eyebrow-accent">404 · Wrong drawer</span>
            <h1>This kitchen guide is not on the counter.</h1>
            <p>
              The address may have changed, but the full guide library and interactive
              match finder are ready to get the comparison back on track.
            </p>
            <div className="button-row">
              <Link href="/guides" className="button">Browse all guides</Link>
              <Link href="/#finder" className="button button-secondary">Use the match finder</Link>
            </div>
          </div>
          <figure className="page-hero-media product-mode">
            <img
              src="https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg"
              alt="Real COSORI TurboBlaze air fryer product photograph"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span>Try the guide library or start with a product-fit question</span>
          </figure>
        </div>
      </section>
    </main>
  );
}
