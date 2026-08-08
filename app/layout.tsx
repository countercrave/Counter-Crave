import type { Metadata } from "next";
import "@/app/globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
  verification: {
    google: "_8MvCmYYFYlif4Q4XLs45uiEkbNeCbNjEc-b9g14xvY",
  },
  robots: siteConfig.allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
