/**
 * Wire Best Cold Press Juicer in India (BL-R40) from workbook picks.
 * Usage: node scripts/wire-cold-press-juicers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const PAGE_ID = "BL-R40";
const PAGE_SLUG = "best-cold-press-juicer-in-india";
const PAGE_TITLE = "Best Cold Press Juicers in India (2026)";
const pagePath = path.join(
  root,
  "content",
  "pages",
  "bl-r40-best-cold-press-juicer-in-india.json",
);
const today = new Date().toISOString().slice(0, 10);

function cleanImage(url) {
  const match = String(url || "").match(/\/images\/I\/([A-Za-z0-9+_-]+)/);
  if (!match) return "";
  return `https://m.media-amazon.com/images/I/${match[1]}._AC_SL1500_.jpg`;
}

function inr(price) {
  const n = Number(String(price).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return "";
  return `₹${n.toLocaleString("en-IN")}`;
}

const PRODUCTS = [
  {
    asin: "B07DLCZT11",
    name: "Kuvings B1700 Dark Silver Cold Press Juicer",
    label: "Best overall",
    bestFor: "Daily juicing, leafy greens and long warranty support",
    verdict:
      "Best overall cold press juicer in India — 240W brushless motor, 76 mm feed tube, deep review evidence and a 12-year motor warranty.",
    score: 83.9,
    editorial: 9.2,
    price: 21999,
    rating: "4.7",
    reviews: "8646",
    specs:
      "Motor: 240W brushless | RPM: 43–50 | Hopper: 76 mm feeding tube | Motor warranty: 12 years | Strainers: Juice strainer; smoothie/sorbet sold separately",
    about:
      "Patented JMCS Technology for more juice yield | Wide 76 mm feed tube reduces chopping | Designed for fruits, vegetables and nut milk | Easy to clean and assemble | Long 12-year motor warranty positioning",
    pros: "Excellent review depth | 12-year motor warranty | Powerful 240W brushless motor | Wide chute | Proven support ecosystem",
    cons: "Higher upfront price | Smoothie and sorbet attachments not included in the standard package",
    image:
      "https://m.media-amazon.com/images/I/61V7QKqCERL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You juice regularly and want the safest all-round pick with strong after-sales support.",
    skipIf: "You need a sub-₹15,000 model with smoothie/sorbet strainers included.",
    chips: "Best overall | 12-yr motor warranty | 8.6k+ ratings",
  },
  {
    asin: "B0DLG58J5X",
    name: "Hestia Nutri-Max Cold Press Slow Juicer",
    label: "Best value",
    bestFor: "Most Indian households wanting premium functions at a mid-range price",
    verdict:
      "Best value pick — 240W motor, three strainers, 10-year motor warranty and strong review volume without Kuvings pricing.",
    score: 80.6,
    editorial: 9.0,
    price: 12999,
    rating: "4.4",
    reviews: "1814",
    specs:
      "Motor: 240W | Extraction: Slow masticating | Hopper: Large feeding tube | Warranty: 1 year parts / 10 years motor | Accessories: Juice, smoothie and sorbet strainers",
    about:
      "Patented auger technology for higher juice yield | Three strainers for juice, smoothie and sorbet | Suited to fruits, vegetables and nut milk | Competitive mid-range price | Long motor warranty coverage",
    pros: "240W motor | Three strainers included | 10-year motor warranty | Strong review volume | Competitive price",
    cons: "Bulkier than compact models | Cleaning still needs careful filter brushing",
    image:
      "https://m.media-amazon.com/images/I/61-b6klnHDL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You want the best balance of accessories, warranty and price.",
    skipIf: "You prefer the smallest possible countertop footprint.",
    chips: "Best value | 3 strainers | 10-yr motor warranty",
  },
  {
    asin: "B07R679HTT",
    name: "AGARO Imperial Cold Press Juicer",
    label: "Best versatile pick",
    bestFor: "Families wanting juice, smoothie and sorbet strainers in one machine",
    verdict:
      "Best versatile mid-range juicer — three strainers, 240W copper motor and a large Indian review base.",
    score: 70.7,
    editorial: 8.6,
    price: 14999,
    rating: "4.4",
    reviews: "3963",
    specs:
      "Motor: 240W copper | RPM: Low-speed cold press | Hopper: 74 mm feeding tube | Accessories: Three strainers | Uses: Juice, smoothies, sorbet and nut milk",
    about:
      "Professional slow juicer positioning | Three strainers for broader recipes | 74 mm feeding tube | Designed for fruit, vegetable juice and nut milks | Popular mid-range AGARO model",
    pros: "Three strainers | 240W copper motor | Large review base | Broad recipe versatility",
    cons: "Warranty less prominent than top competitors | More parts mean more cleaning",
    image:
      "https://m.media-amazon.com/images/I/710U8BxkSlL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You will regularly use smoothie or sorbet modes, not only juice.",
    skipIf: "You want the strongest published motor-warranty story.",
    chips: "Most versatile | 3 strainers | 3.9k+ ratings",
  },
  {
    asin: "B0FX4DXKG3",
    name: "Hurom E30-ST Cold Press Juicer",
    label: "Best compact premium pick",
    bestFor: "Quiet daily juicing in a compact premium footprint",
    verdict:
      "Best compact premium pick — 40–43 RPM, 120 mm inlet, quiet operation and a 10-year motor warranty.",
    score: 71.9,
    editorial: 8.7,
    price: 14999,
    rating: "4.3",
    reviews: "207",
    specs:
      "Motor: 175W | RPM: 40–43 | Hopper: 800 ml / 120 mm inlet | Warranty: 10-year motor / 2-year spare parts | Strainers: Fine and coarse",
    about:
      "Advanced cold press technology claim for higher yield | Compact footprint for smaller kitchens | Quiet daily operation | Fine and coarse strainer system | Official India support",
    pros: "40–43 RPM | 120 mm inlet | 10-year motor warranty | Compact footprint | Quiet operation",
    cons: "Smaller review base than Kuvings/Hestia/AGARO | Aimed at households, not high-volume use",
    image:
      "https://m.media-amazon.com/images/I/61gfPBUT2EL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You want a quieter premium daily juicer with a smaller footprint.",
    skipIf: "You need thousands of ratings before buying.",
    chips: "Compact premium | Quiet | 10-yr motor warranty",
  },
  {
    asin: "B0F5H242S1",
    name: "Atomberg Althea Cold Press Juicer",
    label: "Best for easy cleaning",
    bestFor: "Busy households prioritising simple assembly and cleanup",
    verdict:
      "Best for easy cleaning — 40 RPM, XL hopper, Intelli Rev auto-reverse and a user-friendly assembly story.",
    score: 57.7,
    editorial: 8.2,
    price: 14999,
    rating: "4.2",
    reviews: "508",
    specs:
      "RPM: 40 | Hopper: XL (~121 mm reported) | Features: Intelli Rev auto-reverse, safety locks | Focus: Easy assembly and cleaning",
    about:
      "High-nutrition cold press positioning | Easy three-step assembly | Intelligent auto reverse | Large hopper for less chopping | Safety locks for home use",
    pros: "40 RPM | Easy three-step assembly | Intelli Rev auto-reverse | Safety locks | Large hopper",
    cons: "Motor warranty less clearly published | Price overlaps specialist juicer brands",
    image:
      "https://m.media-amazon.com/images/I/71D5d1gMLJL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "Cleanup effort is your #1 decision factor.",
    skipIf: "You want the strongest warranty documentation first.",
    chips: "Easiest cleaning | XL hopper | Auto-reverse",
  },
  {
    asin: "B0FMFQ6RK1",
    name: "Rico SJ2508 Cold Press Slow Juicer",
    label: "Best under ₹10,000",
    bestFor: "Budget families wanting warranty, service access and a sorbet function",
    verdict:
      "Best under ₹10,000 — 300W motor, 46 RPM, five-year motor warranty and a sorbet attachment included.",
    score: 69.0,
    editorial: 8.5,
    price: 8498,
    rating: "4.5",
    reviews: "464",
    specs:
      "Motor: 300W | RPM: 46 | Inlet: 75 mm | Warranty: 1-year product / 5-year motor | Accessories: Sorbet / ice-cream attachment",
    about:
      "Cold press slow juicer with ice cream maker function | Claims higher juice yield and less waste | Low-noise positioning | Anti-drip design | Broad service network",
    pros: "300W motor | 46 RPM | Five-year motor warranty | Sorbet attachment | Broad service network",
    cons: "Shorter motor warranty than Kuvings/Hestia/Hurom | Feed chute smaller than newer batch-style models",
    image:
      "https://m.media-amazon.com/images/I/61PRrzsvf3L._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "Your hard budget is under ₹10,000 and you still want support.",
    skipIf: "You can stretch to Hestia for more accessories and a longer motor warranty.",
    chips: "Best under ₹10k | Sorbet mode | 5-yr motor warranty",
  },
  {
    asin: "B09D8LDZJM",
    name: "Kuvings EVO810 Professional Whole Slow Juicer",
    label: "Best premium upgrade",
    bestFor: "Premium buyers who want upgraded construction and whole-fruit feeding",
    verdict:
      "Premium upgrade — professional whole slow juicer design with a 12-year motor warranty when budget is secondary.",
    score: 61.6,
    editorial: 8.3,
    price: 39999,
    rating: "4.6",
    reviews: "74",
    specs:
      "Motor: 240W | Extraction: Low-speed cold press | Feed: Wide whole-fruit system | Motor warranty: 12 years",
    about:
      "Professional whole slow juicer positioning | Rubber and silicon-free technology claim | Strong 240W motor | Premium construction | Long motor warranty",
    pros: "Premium construction | 240W motor | 12-year motor warranty | Strong whole-fruit positioning",
    cons: "Expensive | Much smaller review sample than the B1700",
    image:
      "https://m.media-amazon.com/images/I/7107vWuWACL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "Design and premium construction matter more than value.",
    skipIf: "You want maximum ratings-per-rupee — choose the B1700 instead.",
    chips: "Premium upgrade | Whole fruit | 12-yr warranty",
  },
  {
    asin: "B0FN7ZGQRM",
    name: "SOLARA Cold Press Juicer",
    label: "Best affordable wide-feed option",
    bestFor: "First-time or occasional slow-juicer users on a budget",
    verdict:
      "Affordable wide-feed entry point — practical for first-time buyers who want convenience over premium warranty length.",
    score: 61.0,
    editorial: 7.9,
    price: 8499,
    rating: "4.1",
    reviews: "704",
    specs:
      "RPM: 52 | Feed: Wide feed with automatic fruit-cutting design | Warranty: 1 year standard",
    about:
      "All-in-one cold-press juicer for home | Automatic fruit-cutting design in listing | Slow juicer for fruits and vegetables | Safety lock and auto shut-off | Budget-friendly entry price",
    pros: "Affordable | 52 RPM extraction | Wide-feed convenience | Safety lock and auto shut-off",
    cons: "Shorter standard warranty than premium competitors | Lower rating than leading picks",
    image:
      "https://m.media-amazon.com/images/I/71FGVoiNiRL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You want a low-cost first slow juicer with wide-feed convenience.",
    skipIf: "Long motor warranty is non-negotiable.",
    chips: "Affordable | Wide feed | First juicer",
  },
  {
    asin: "B0DFM78LQ1",
    name: "Borosil Vita Rich Cold Press Juicer",
    label: "Best established Indian brand option",
    bestFor: "Buyers who prefer a familiar Indian kitchen-appliance brand",
    verdict:
      "Brand-led mid-range option — 250W DC motor, wide-mouth hopper and a 2-year warranty from Borosil.",
    score: 54.4,
    editorial: 7.8,
    price: 12589,
    rating: "4.2",
    reviews: "78",
    specs:
      "Motor: 250W DC | Hopper: 1.5 L wide-mouth | Package: 1 L jug and pulp collector | Warranty: 2 years | Feature: Anti-drip tap, reverse function",
    about:
      "Wide-mouth hopper reduces prep time | Anti-drip tap for cleaner pouring | Reverse function for pulp cleaning | Auto cut-off safety | Familiar Indian brand support",
    pros: "250W DC motor | Large hopper | 2-year warranty | Anti-drip tap | Familiar Indian brand",
    cons: "Limited review sample | Fewer multifunction accessories than Hestia or AGARO Imperial",
    image:
      "https://m.media-amazon.com/images/I/61b+zlbRlrL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "Brand familiarity and local trust matter as much as specs.",
    skipIf: "You want three strainers or a 10+ year motor warranty.",
    chips: "Indian brand | Wide hopper | 2-yr warranty",
  },
  {
    asin: "B0GCJC62XG",
    name: "AGARO Regal Cold Press Juicer",
    label: "Best simple mid-budget pick",
    bestFor: "Buyers wanting a simpler AGARO model around ₹10,000",
    verdict:
      "Simple mid-budget AGARO — 250W DC motor, auto reverse and safety lock without paying for Imperial’s extra strainers.",
    score: 55.1,
    editorial: 7.7,
    price: 9999,
    rating: "4.4",
    reviews: "52",
    specs:
      "Motor: 250W DC | Features: Auto reverse, advanced safety lock | Filter: Stainless-steel | Materials: BPA-free plastic",
    about:
      "Easy assembly and cleaning focus | Auto reverse for stuck produce | Advanced safety lock | Fruit, vegetable juice and nut milk | Competitive price near ₹10,000",
    pros: "250W DC motor | Auto reverse | Safety lock | BPA-free components | Competitive price",
    cons: "Smaller review sample | Fewer included attachments than the Imperial",
    image:
      "https://m.media-amazon.com/images/I/712g--W6MVL._AC_AIweblab1378949,T2_SF516.0,327.0_PQ62_.jpg?aicid=productui-image-1",
    buyIf: "You want AGARO support without Imperial complexity.",
    skipIf: "You need smoothie/sorbet strainers in the box.",
    chips: "Mid-budget | Auto reverse | Around ₹10k",
  },
];

const page = {
  pageId: PAGE_ID,
  title: PAGE_TITLE,
  slug: PAGE_SLUG,
  canonicalPath: `/${PAGE_SLUG}/`,
  description:
    "Compare the best cold press juicers in India by price, RPM, motor, warranty, feeding chute, cleaning and ratings. Top picks: Kuvings B1700, Hestia Nutri-Max, AGARO Imperial and more.",
  pageType: "Roundup",
  priority: "P1",
  cluster: "Blenders",
  parentPillar: null,
  primaryKeyword: "best cold press juicer in India",
  secondaryKeywords: [
    "cold press juicer for home",
    "slow juicer in India",
    "cold press juicer price",
    "best slow juicer",
    "masticating juicer India",
  ],
  searchIntent: "Commercial Investigation",
  funnel: "Ads",
  croOptimized: true,
  targetLength: "2,500–4,000",
  monetization: "High — Google Ads landing + Amazon Buy Now CTAs",
  schemaRecommendation: "Article + ItemList + FAQPage + BreadcrumbList",
  evidenceRequirement:
    "Workbook-backed shortlist from Amazon India prices, ratings, RPM, warranty and accessories.",
  answerBlockBrief:
    "Kuvings B1700 best overall; Hestia Nutri-Max best value; Rico SJ2508 best under ₹10,000.",
  requiredTables: "Top 10 comparison; buying criteria",
  ctaGuidance: "Buy Now above the fold + sticky mobile Buy Now on top pick",
  faqGuidance: "8 practical India-focused FAQs",
  summary:
    "Kuvings B1700 is our best overall cold press juicer in India for regular juicing and after-sales confidence. Hestia Nutri-Max is the best value for most families. AGARO Imperial is the most versatile mid-range pick, Hurom E30-ST is the best compact premium model, and Rico SJ2508 is the strongest option under ₹10,000. Use Buy Now to confirm today’s Amazon India price before you purchase.",
  sections: [
    {
      heading: "Who should buy and who should skip",
      level: 2,
      paragraphs: [
        "Buy a cold press (slow / masticating) juicer if you make juice regularly and care about quieter operation, denser juice and better leafy-green handling than a basic centrifugal juicer.",
        "Skip if you only juice occasionally and want the absolute lowest price and fastest cleanup — a centrifugal juicer or a strong blender may be enough.",
      ],
      bullets: [
        "Daily juice habit → Kuvings B1700 or Hestia Nutri-Max",
        "Budget under ₹10,000 → Rico SJ2508 or SOLARA",
        "Smoothie / sorbet versatility → Hestia Nutri-Max or AGARO Imperial",
        "Compact premium / quiet → Hurom E30-ST",
      ],
    },
    {
      heading: "How we chose these cold press juicers",
      level: 2,
      paragraphs: [
        "We filtered Amazon India listings to genuine cold-press, slow or masticating juicers, then compared listed price, rating depth, motor/RPM details, feed-chute convenience, strainers, motor warranty and India support signals.",
        "A 4.6 rating from five buyers is weaker evidence than a 4.4 rating from thousands of buyers. We also avoided ranking purely by wattage — RPM, auger design and torque matter more in a slow juicer.",
      ],
      bullets: [
        "Review confidence and rating count",
        "Motor warranty and service ecosystem",
        "Feed chute / hopper convenience for Indian produce",
        "Included strainers and cleaning effort",
      ],
    },
    {
      heading: "What matters in a cold press juicer for Indian kitchens",
      level: 2,
      paragraphs: [
        "A good model must handle carrots, beetroot, amla, ginger, turmeric, pomegranate and leafy greens without constant clogging. Ease of cleaning, spare-part availability and warranty coverage matter as much as wattage.",
        "Look for low RPM extraction, a usable feed chute, clear warranty terms and accessories you will actually use (smoothie/sorbet strainers if you want more than juice).",
      ],
      bullets: [
        "Low-speed extraction (often ~40–50 RPM)",
        "Wide chute or XL hopper to cut prep time",
        "Published motor warranty (5–12 years preferred)",
        "Cleaning tools / dishwasher-safe parts where available",
      ],
    },
    {
      heading: "Cold press vs centrifugal juicer vs blender",
      level: 2,
      paragraphs: [
        "Cold press juicers crush and press produce slowly. Centrifugal juicers are faster and usually cheaper, but can introduce more heat/air and struggle more with leafy greens. Blenders keep fibre in the cup — great for smoothies, different from strained juice.",
        "Choose cold press when juice quality and quiet daily use matter. Choose centrifugal for speed/budget. Choose a blender when you want whole-fruit drinks with fibre.",
      ],
    },
    {
      heading: "Cleaning and maintenance tips",
      level: 2,
      paragraphs: [
        "Rinse the auger and strainer immediately after juicing — dried pulp is the #1 reason cleaning feels hard. Use the brush on the filter mesh and check the pulp outlet for clogs after fibrous produce like amla or greens.",
        "If your model has auto-reverse, use it when produce stalls instead of forcing the pusher. Confirm spare filters and gaskets are available before you buy.",
      ],
    },
    {
      heading: "Final verdict",
      level: 2,
      paragraphs: [
        "Start with Kuvings B1700 if you want the strongest all-round pick. Choose Hestia Nutri-Max if you want the best value package for most Indian homes. Pick Rico SJ2508 if you must stay under ₹10,000.",
        "Prices and ratings change — tap Buy Now on your shortlisted model and verify today’s Amazon India offer, warranty card and included accessories before checkout.",
      ],
    },
  ],
  faqs: [
    {
      question: "Which is the best cold press juicer in India?",
      answer:
        "Kuvings B1700 is our best overall pick for regular juicing, review confidence and long motor-warranty support. Confirm live price on Amazon before buying.",
    },
    {
      question: "Which cold press juicer offers the best value?",
      answer:
        "Hestia Nutri-Max is the best value for most households — mid-range price, three strainers and a long motor warranty.",
    },
    {
      question: "What is the best cold press juicer under ₹10,000?",
      answer:
        "Rico SJ2508 is our strongest sub-₹10,000 pick when you weigh price, warranty, service access and sorbet versatility together.",
    },
    {
      question: "How many RPM should a cold press juicer have?",
      answer:
        "Most good slow juicers run around 40–50 RPM. Lower speed alone is not enough — also check auger design, feed chute and cleaning effort.",
    },
    {
      question: "Can cold press juicers handle amla, ginger and leafy greens?",
      answer:
        "Yes — that is a major reason to buy one. Feed fibrous produce gradually, use reverse if it stalls, and clean the strainer promptly.",
    },
    {
      question: "How long does cold-pressed juice last?",
      answer:
        "Fresh juice is best the same day. Refrigerate promptly in a sealed bottle and finish within about 24–48 hours depending on ingredients and storage.",
    },
    {
      question: "Is a long motor warranty a full-product warranty?",
      answer:
        "Usually no. Motor warranties (5–12 years) often differ from shorter coverage on plastic parts and electronics. Read the current brand terms.",
    },
    {
      question: "Is a cold press juicer better than a blender?",
      answer:
        "Different jobs. A cold press juicer makes strained juice; a blender keeps fibre for smoothies. Many homes eventually own both.",
    },
  ],
  productPageIds: [PAGE_ID],
  relatedPageIds: [],
  author: "Navjeet Kamboj",
  reviewer: null,
  publishedAt: today,
  updatedAt: today,
  heroImage: PRODUCTS[0] ? cleanImage(PRODUCTS[0].image) : null,
  heroImageAlt: "Best cold press juicers in India — top pick product image",
  draft: false,
  noindex: false,
};

fs.writeFileSync(pagePath, `${JSON.stringify(page, null, 2)}\n`);

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const kept = rows.filter((row) => row.pageId !== PAGE_ID);

PRODUCTS.forEach((product, index) => {
  const rank = index + 1;
  kept.push({
    pageId: PAGE_ID,
    pageTitle: PAGE_TITLE,
    pageSlug: PAGE_SLUG,
    pageType: "Roundup",
    slotId: `rank-${rank}`,
    slotLabel: product.label,
    rank: String(rank),
    productName: product.name,
    asin: product.asin,
    bestFor: product.bestFor,
    shortVerdict: product.verdict,
    editorialScore: String(product.editorial),
    keySpecs: product.specs,
    aboutThisItem: product.about,
    pros: product.pros,
    cons: product.cons,
    imageUrl: cleanImage(product.image),
    imageWidth: "1500",
    imageHeight: "1500",
    imageAlt: product.name,
    imageSource: "Amazon CDN (workbook)",
    checkedAt: today,
    listPrice: inr(product.price),
    amazonRating: product.rating,
    ratingCount: product.reviews,
    vsCompetitor: "",
    comparisonChips: product.chips,
    notes: `buyIf: ${product.buyIf} || skipIf: ${product.skipIf}`,
    comparisonScore: String(product.score),
  });
});

fs.writeFileSync(csvPath, toCsv(kept));
console.log(`Wrote page ${pagePath}`);
console.log(`Wired ${PRODUCTS.length} products into CSV for ${PAGE_ID}`);
console.log("Next: npm run products:generate");
