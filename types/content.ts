export type PageSection = {
  heading: string;
  level?: 2 | 3;
  brief?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type BrandProfileProduct = {
  name: string;
  asin: string;
  imageUrl?: string;
  listPrice?: string;
  amazonRating?: string;
  ratingCount?: string;
  productType?: string;
  capacity?: string;
  bestFor?: string;
  why?: string;
  features?: string;
};

export type BrandProfile = {
  brand: string;
  brandSlug: string;
  logoUrl?: string;
  award?: string;
  brandScore?: number | null;
  rank?: number;
  marketPosition?: string;
  profile?: string;
  summary?: string;
  bestFor?: string;
  strengths?: string[];
  weaknesses?: string[];
  coreTypes?: string;
  signatureTech?: string;
  warranty?: string;
  officialWebsite?: string;
  product: BrandProfileProduct;
};

export type ContentPage = {
  pageId: string;
  title: string;
  slug: string;
  canonicalPath: string;
  description: string;
  pageType: string;
  priority: string;
  cluster: string;
  parentPillar?: string | null;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  funnel?: string;
  targetLength?: string;
  monetization?: string;
  schemaRecommendation?: string;
  evidenceRequirement?: string;
  answerBlockBrief?: string;
  requiredTables?: string;
  ctaGuidance?: string;
  faqGuidance?: string;
  summary?: string;
  sections?: PageSection[];
  faqs?: FaqItem[];
  /** Brand-directory roundups: logo + flagship product blocks. */
  brandProfiles?: BrandProfile[];
  /** Optional link to a filterable collection route. */
  collectionPath?: string | null;
  productPageIds?: string[];
  relatedPageIds?: string[];
  author?: string;
  reviewer?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  draft: boolean;
  noindex: boolean;
};

export type ProductLink = {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  pageType: string;
  slotId: string;
  slotLabel: string;
  rank?: number;
  productName: string;
  asin: string;
  affiliateUrl: string;
  bestFor?: string;
  shortVerdict?: string;
  editorialScore?: number | null;
  /** Raw workbook Comparison Score (typically 0–100) when provided. */
  comparisonScore?: number | null;
  keySpecs?: string[];
  /** Amazon "About this item" feature bullets (not editorial pros). */
  aboutThisItem?: string[];
  pros?: string[];
  cons?: string[];
  buyIf?: string;
  skipIf?: string;
  imageUrl?: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageAlt?: string;
  imageSource?: string;
  checkedAt?: string;
  /** Snapshot list price from provided Amazon workbook/CSV (confirm live). */
  listPrice?: string;
  /** Snapshot Amazon customer rating (e.g. "4.7") from provided data. */
  amazonRating?: string;
  /** Snapshot review count from provided data. */
  ratingCount?: string;
  /** Sheet-backed vs nearest competitor callout. */
  vsCompetitor?: string;
  /** Short comparison chips for visual scanning. */
  comparisonChips?: string[];
  trackingKey: string;
};
