import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { getSiteUrl } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "CounterCrave Kitchen Guides",
    template: "%s | CounterCrave",
  },
  description:
    "Decision-first kitchen appliance buying guides for air fryers, blenders, food processors and more.",
  openGraph: {
    type: "website",
    title: "CounterCrave Kitchen Guides",
    description: "Choose kitchen appliances by portions, space, cleanup and real cooking tasks.",
    images: [{ url: "/countercrave-og.png", width: 1200, height: 630, alt: "CounterCrave kitchen buying guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CounterCrave Kitchen Guides",
    description: "Clear kitchen appliance picks, tradeoffs and long-form buyer guides.",
    images: ["/countercrave-og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
