import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://countercrave.com"),
  title: {
    default: "CounterCrave Kitchen Guides",
    template: "%s | CounterCrave",
  },
  description:
    "Decision-first kitchen appliance buying guides for air fryers, blenders, coffee makers, rice cookers, vacuum sealers, wine coolers and pizza ovens.",
  openGraph: {
    type: "website",
    title: "CounterCrave Kitchen Guides",
    description: "Choose kitchen appliances by portions, space, cleanup and the food you actually make.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
