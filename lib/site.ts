const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://countercrave.com";

/** Sitewide indexing enabled for production (dofollow & indexable). */
const allowIndexing = true;

export const siteConfig = {
  name: "CounterCrave",
  tagline: "Smart buying guides for countertop kitchen gear.",
  description:
    "Clean, practical CounterCrave buying guides that compare air fryers, blenders and other kitchen appliances with clear trade-offs and disclosed Amazon links.",
  siteUrl: configuredSiteUrl,
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "cravecounter1@gmail.com",
  amazonAssociateTag:
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "visitbest07-20",
  isPreview: process.env.VERCEL_ENV === "preview",
  /** Sitewide indexing enabled. */
  allowIndexing,
} as const;
