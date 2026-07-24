import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container main-content empty-state">
      <span className="eyebrow">404</span>
      <h1>That page is not available.</h1>
      <p>
        It may still be an unpublished editorial draft or the URL may have
        changed.
      </p>
      <Link className="button button-primary" href="/">
        Return home
      </Link>
    </main>
  );
}
