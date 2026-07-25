/**
 * Generate high-intent price-band kitchen roundup articles if missing.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagesDir = path.join(root, "content", "pages");
const today = new Date().toISOString().slice(0, 10);

const articles = [
  {
    pageId: "AF-R50",
    slug: "best-air-fryer-under-50",
    title: "Best Air Fryers Under $50",
    cluster: "Air Fryers",
    parentPillar: "AF-PIL",
    primaryKeyword: "best air fryer under $50",
    description:
      "Compare the best air fryers under $50 with clear capacity trade-offs, cleanup notes and who should buy each budget pick.",
  },
  {
    pageId: "AF-R150",
    slug: "best-air-fryer-under-200",
    title: "Best Air Fryers Under $200",
    cluster: "Air Fryers",
    parentPillar: "AF-PIL",
    primaryKeyword: "best air fryer under $200",
    description:
      "Compare dual-zone and premium single-basket air fryers under $200 for families and serious weeknight cooking.",
  },
  {
    pageId: "BL-R50",
    slug: "best-blender-under-50",
    title: "Best Blenders Under $50",
    cluster: "Blenders",
    parentPillar: "BL-PIL",
    primaryKeyword: "best blender under $50",
    description:
      "Find the best blenders under $50 for basic smoothies, personal cups and tight-budget kitchens.",
  },
  {
    pageId: "BL-R150",
    slug: "best-blender-under-150",
    title: "Best Blenders Under $150",
    cluster: "Blenders",
    parentPillar: "BL-PIL",
    primaryKeyword: "best blender under $150",
    description:
      "Compare powerful pitcher and personal blenders under $150 for ice, frozen fruit and everyday smoothies.",
  },
  {
    pageId: "TO-R100",
    slug: "best-toaster-oven-under-100",
    title: "Best Toaster Ovens Under $100",
    cluster: "Toaster Ovens",
    parentPillar: "TO-PIL",
    primaryKeyword: "best toaster oven under $100",
    description:
      "Compare toaster ovens under $100 for toast, bake and compact countertop cooking.",
  },
  {
    pageId: "EK-R50",
    slug: "best-electric-kettle-under-50",
    title: "Best Electric Kettles Under $50",
    cluster: "Electric Kettles",
    parentPillar: "EK-PIL",
    primaryKeyword: "best electric kettle under $50",
    description:
      "Compare electric kettles under $50 for boil speed, safety and everyday tea or coffee water.",
  },
  {
    pageId: "RC-R50",
    slug: "best-rice-cooker-under-50",
    title: "Best Rice Cookers Under $50",
    cluster: "Rice Cookers",
    parentPillar: "RC-PIL",
    primaryKeyword: "best rice cooker under $50",
    description:
      "Compare rice cookers under $50 for small households, sticky rice and simple one-touch cooking.",
  },
  {
    pageId: "WM-R50",
    slug: "best-waffle-maker-under-50",
    title: "Best Waffle Makers Under $50",
    cluster: "Waffle Makers",
    parentPillar: "WM-PIL",
    primaryKeyword: "best waffle maker under $50",
    description:
      "Compare waffle makers under $50 for Belgian, classic and mini waffle breakfast routines.",
  },
  {
    pageId: "FP-R100",
    slug: "best-food-processor-under-100",
    title: "Best Food Processors Under $100",
    cluster: "Food Processors",
    parentPillar: "FP-PIL",
    primaryKeyword: "best food processor under $100",
    description:
      "Compare food processors under $100 for chopping, slicing and everyday meal-prep bowls.",
  },
  {
    pageId: "CG-R50",
    slug: "best-coffee-grinder-under-50",
    title: "Best Coffee Grinders Under $50",
    cluster: "Coffee Grinders",
    parentPillar: "CG-PIL",
    primaryKeyword: "best coffee grinder under $50",
    description:
      "Compare coffee grinders under $50 for drip, French press and budget burr or blade setups.",
  },
];

let created = 0;
for (const item of articles) {
  const filename = `${item.pageId.toLowerCase()}-${item.slug}.json`;
  const full = path.join(pagesDir, filename);
  const exists = fs
    .readdirSync(pagesDir)
    .some((file) => {
      try {
        const page = JSON.parse(fs.readFileSync(path.join(pagesDir, file), "utf8"));
        return page.pageId === item.pageId || page.slug === item.slug;
      } catch {
        return false;
      }
    });
  if (exists) continue;

  const page = {
    pageId: item.pageId,
    title: item.title,
    slug: item.slug,
    canonicalPath: `/${item.slug}/`,
    description: item.description,
    pageType: "Roundup",
    priority: "P1",
    cluster: item.cluster,
    parentPillar: item.parentPillar,
    primaryKeyword: item.primaryKeyword,
    secondaryKeywords: [
      `${item.primaryKeyword} reviews`,
      `${item.primaryKeyword} comparison`,
      `${item.primaryKeyword} buying guide`,
    ],
    searchIntent: "Commercial Investigation",
    funnel: "BOFU",
    targetLength: "3,500–5,000",
    monetization: "High — product table + contextual CTAs",
    schemaRecommendation: "Article + ItemList + BreadcrumbList",
    evidenceRequirement:
      "Original selection methodology; spec verification; decision criteria; custom comparison table.",
    answerBlockBrief:
      "Answer-first verdict; ranked list; buy-if/skip-if; concise FAQs.",
    requiredTables: "Top picks table; full comparison table",
    ctaGuidance: "Disclosure → Check price on Amazon; ratings on Amazon CTA",
    faqGuidance: "4–6 practical FAQs",
    summary: `Quick verdict for ${item.primaryKeyword}: start with capacity and cleanup fit, then compare the labeled shortlist below. Confirm Amazon details and customer ratings on the product page before buying.`,
    sections: [
      {
        heading: "Top picks at a glance",
        level: 2,
        paragraphs: [
          `This ${item.primaryKeyword} guide keeps best overall near the top, then expands into specialty winners for budget, compact kitchens, families and cleanup.`,
          "Use the product cards for Amazon availability. We link out for live customer ratings instead of copying Amazon reviews.",
        ],
        bullets: [],
      },
      {
        heading: "How we chose these products",
        level: 2,
        paragraphs: [
          "We prioritize verifiable capacity, footprint and cleanup over feature count, then map each pick to a clear shopper profile.",
        ],
        bullets: [
          "Match size to household needs",
          "Prefer clear buy-if / skip-if advice",
          "Confirm ASINs and accessories on Amazon",
        ],
      },
      {
        heading: "How to choose in this price range",
        level: 2,
        paragraphs: [
          "Price caps change which compromises matter most. Under tighter budgets, favor simple reliable controls and the right size. As budget rises, dual zones, stronger motors or better cleanup become worth paying for.",
        ],
        bullets: [],
      },
    ],
    faqs: [
      {
        question: `What is the best ${item.primaryKeyword}?`,
        answer:
          "Start with the best overall pick if it matches your kitchen size, then check specialty winners for compact, family or budget constraints.",
      },
      {
        question: "Do you show Amazon star ratings on CounterCrave?",
        answer:
          "No. Amazon Associates rules restrict republishing customer reviews and ratings, so we link to Amazon for the latest shopper feedback.",
      },
    ],
    productPageIds: [item.pageId],
    relatedPageIds: [item.parentPillar],
    author: "Navjeet Kamboj",
    reviewer: null,
    publishedAt: today,
    updatedAt: today,
    heroImage: null,
    heroImageAlt: null,
    draft: false,
    noindex: false,
  };

  fs.writeFileSync(full, `${JSON.stringify(page, null, 2)}\n`);
  created += 1;
  console.log("created", item.slug);
}

console.log(`Created ${created} new price-band articles.`);
