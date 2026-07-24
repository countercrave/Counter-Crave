export const siteConfig = {
  name: "CounterCrave",
  tagline: "Honest countertop kitchen gear picks.",
  description:
    "Independent countertop kitchen appliance comparisons, reviews and buying guides.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://countercrave.com",
  contactEmail: "hello@countercrave.com",
  amazonAssociateTag:
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "visitbest07-20",
} as const;
