import Link from "next/link";

export function AffiliateDisclosure() {
  return (
    <aside className="disclosure" aria-label="Affiliate disclosure">
      <strong>Disclosure:</strong> As an Amazon Associate I earn from
      qualifying purchases.{" "}
      <Link href="/affiliate-disclosure/">Learn how affiliate links work.</Link>
    </aside>
  );
}
