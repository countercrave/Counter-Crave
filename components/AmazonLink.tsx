"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buildAmazonProductUrl } from "@/lib/amazon";

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
  children?: ReactNode;
};

export function AmazonLink({
  asin,
  pageId,
  productName,
  placement,
  children = "Check price on Amazon",
  className,
  onClick,
  ...props
}: AmazonLinkProps) {
  let href: string;

  try {
    href = buildAmazonProductUrl(asin);
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
