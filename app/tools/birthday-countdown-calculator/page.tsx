import type { Metadata } from "next";
import ClientCalculator from "./ClientCalculator";

export const metadata: Metadata = {
  title: "Birthday Countdown Calculator — Days Until Your Next Birthday | Age Calculator Lab",
  description: "Calculate exactly how many days remain until your next birthday. See the birthday date, weekday, turning age, weeks + days, days since your last birthday and leap-day handling — free and browser-based.",
  alternates: {
    canonical: "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/",
  },
  openGraph: {
    type: "website",
    siteName: "Age Calculator Lab",
    title: "Birthday Countdown Calculator — Days Until Your Next Birthday",
    description: "Count the exact days until your next birthday and see the date, weekday, turning age and related birthday timing details.",
    url: "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 675,
        alt: "Birthday Countdown Calculator Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Countdown Calculator — Days Until Your Next Birthday",
    description: "Count the exact days until your next birthday and see the date, weekday, turning age and related birthday timing details.",
    images: ["/og-image.png"],
  },
};

export default function BirthdayCountdownPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/#webpage",
        "url": "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/",
        "name": "Birthday Countdown Calculator — Days Until Your Next Birthday",
        "description": "Free browser-based birthday countdown calculator showing days until the next birthday, birthday date, weekday, turning age and related timing details.",
        "isPartOf": { "@id": "https://age-calculator-lab.vercel.app/#website" },
        "dateModified": "2026-08-11"
      },
      {
        "@type": "WebSite",
        "@id": "https://age-calculator-lab.vercel.app/#website",
        "url": "https://age-calculator-lab.vercel.app/",
        "name": "Age Calculator Lab"
      },
      {
        "@type": "WebApplication",
        "name": "Birthday Countdown Calculator",
        "url": "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Calculates the calendar countdown from a selected reference date to the next birthday anniversary."
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://age-calculator-lab.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Birthday Countdown Calculator", "item": "https://age-calculator-lab.vercel.app/tools/birthday-countdown-calculator/" }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <ClientCalculator />
    </>
  );
}
