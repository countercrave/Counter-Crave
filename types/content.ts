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
  keySpecs?: string[];
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
  trackingKey: string;
};
