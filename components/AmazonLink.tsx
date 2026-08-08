"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buildAmazonProductUrl, type AmazonMarketplace } from "@/lib/amazon";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type AmazonLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  asin: string;
  pageId: string;
  productName: string;
  placement: string;
  /** Prefer pre-built affiliate URL when marketplace differs (e.g. amazon.in). */
  hrefOverride?: string;
  marketplace?: AmazonMarketplace;
  children?: ReactNode;
};

export function AmazonLink({
  asin,
  pageId,
  productName,
  placement,
  hrefOverride,
  marketplace = "com",
  children = "Buy Now",
  className,
  onClick,
  ...props
}: AmazonLinkProps) {
  let href: string;

  try {
    href =
      hrefOverride?.trim() ||
      buildAmazonProductUrl(asin, undefined, marketplace);
  } catch {
    return (
      <span className="button button-disabled" aria-disabled="true">
        ASIN required
      </span>
    );
  }

  return (
    <a
      {...props}
      href={href}
      className={className || "button button-primary"}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      data-page-id={pageId}
      data-asin={asin}
      data-placement={placement}
      onClick={(event) => {
        window.gtag?.("event", "amazon_outbound_click", {
          page_id: pageId,
          asin,
          product_name: productName,
          placement,
          link_url: href,
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
