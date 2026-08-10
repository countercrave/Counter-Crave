import fs from "node:fs";

const sourceMd = "C:/Users/PC/Downloads/17 Best Blender Food Processor Combos in 2026_ Compare Power, Capacity & Value.md";
const targetJson = "content/pages/fp-r09-best-blender-food-processor-combo.json";

const rawText = fs.readFileSync(sourceMd, "utf8");

// Parse Markdown into sections for PageRenderer
const lines = rawText.split("\n");

const sections = [];
const faqs = [];

let currentSection = null;
let inFaq = false;
let inSeo = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith("## SEO Information") || line.startsWith("# SEO Information")) {
    inSeo = true;
    continue;
  }
  if (inSeo) continue;

  if (line.startsWith("# Frequently Asked Questions") || line.startsWith("## Frequently Asked Questions")) {
    inFaq = true;
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
    continue;
  }

  if (inFaq) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const q = line.replace(/^(##|###)\s+/, "").trim();
      let a = "";
      while (i + 1 < lines.length && !lines[i + 1].trim().startsWith("#")) {
        i++;
        const nextLine = lines[i].trim();
        if (nextLine) {
          a += (a ? " " : "") + nextLine;
        }
      }
      if (q && a) {
        faqs.push({ question: q, answer: a });
      }
      continue;
    }
  }

  // Heading matching: #, ##, ###
  if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
    if (currentSection) {
      sections.push(currentSection);
    }
    const level = line.startsWith("# ") ? 1 : line.startsWith("## ") ? 2 : 3;
    const heading = line.replace(/^(#|##|###)\s+/, "").replace(/^\d+\.\s*/, "").trim();
    currentSection = {
      heading,
      level,
      paragraphs: [],
      bullets: []
    };
    continue;
  }

  if (!currentSection) {
    currentSection = {
      heading: "Introduction",
      level: 2,
      paragraphs: [],
      bullets: []
    };
  }

  if (line.startsWith("- ") || line.startsWith("* ")) {
    const bulletText = line.replace(/^[-*]\s+/, "").trim();
    if (bulletText) currentSection.bullets.push(bulletText);
  } else if (line.length > 0 && !line.startsWith("![") && !line.startsWith("---")) {
    currentSection.paragraphs.push(line);
  }
}

if (currentSection) {
  sections.push(currentSection);
}

const pageData = {
  pageId: "FP-R09",
  title: "17 Best Blender Food Processor Combos in 2026: Compare Power, Capacity & Value",
  slug: "best-blender-food-processor-combo",
  canonicalPath: "/best-blender-food-processor-combo/",
  description: "Compare the 17 best blender food processor combos for 2026 from Ninja, Vitamix, Cuisinart, Hamilton Beach, and Oster by power, capacity, price, and ratings.",
  pageType: "Roundup",
  priority: "P1",
  cluster: "Food Processors",
  parentPillar: "FP-PIL",
  primaryKeyword: "best blender food processor combo",
  secondaryKeywords: [
    "best blender and food processor combo",
    "blender food processor combo",
    "food processor blender combo",
    "best food processor and blender",
    "blender with food processor",
    "blender and food processor in one",
    "Ninja blender food processor combo",
    "blender food processor combo with glass jar"
  ],
  searchIntent: "Commercial Investigation",
  funnel: "BOFU",
  targetLength: "3,500–5,000",
  monetization: "High — product comparison table + direct Amazon CTAs",
  schemaRecommendation: "Article + ItemList + BreadcrumbList",
  evidenceRequirement: "Independent comparison of motor power, blender capacity, processor bowl volume, and accessory packages based on published specifications.",
  answerBlockBrief: "Top overall pick is Ninja Professional Plus Kitchen System BN801 for its 1400W motor, 72oz pitcher, 64oz processor bowl, and Auto-iQ programs. Premium buyers should look at Vitamix Ascent X4 SmartPrep, while budget buyers win with Hamilton Beach 58163.",
  requiredTables: "Quick picks; comparison table; buying guide factors",
  ctaGuidance: "Disclosure → Check price on Amazon; direct product buy links",
  faqGuidance: "Answer questions on blender vs processor differences, dough mixing, glass jars, and household sizing in 40-80 words.",
  summary: "Finding the best blender food processor combo can save counter space, reduce the number of appliances in your kitchen, and make everything from smoothies and frozen drinks to salsa, dough, chopped vegetables, and meal prep easier.",
  sections,
  faqs,
  productPageIds: [],
  relatedPageIds: [
    "FP-PIL",
    "FP-HUB",
    "FP-R01",
    "FP-R02",
    "FP-R03",
    "BL-PIL"
  ],
  author: "Navjeet Kamboj",
  reviewer: null,
  publishedAt: "2026-08-10",
  updatedAt: "2026-08-10",
  heroImage: null,
  heroImageAlt: null,
  draft: false,
  noindex: false
};

fs.writeFileSync(targetJson, JSON.stringify(pageData, null, 2), "utf8");
console.log(`Successfully converted full markdown into ${targetJson} with ${sections.length} sections and ${faqs.length} FAQs!`);
