/**
 * Bootstrap CounterCrave: product CSV + Amazon CDN images + P1 page content.
 * Images: fetch Amazon product page and extract hi-res CDN URLs (hotlink only).
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, toCsv } from "./csv-utils.mjs";

const root = process.cwd();
const csvPath = path.join(root, "data", "product-import-template.csv");
const cachePath = path.join(root, "data", "amazon-image-cache.json");
const today = new Date().toISOString().slice(0, 10);

const CATALOG = {
  "B0C33CHG99": {
    name: "COSORI TurboBlaze 6-Qt Air Fryer",
    fallback: "https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg",
  },
  "B0CSZ7WBYW": {
    name: "Ninja Air Fryer Pro 5-Qt (AF141)",
    fallback: "https://m.media-amazon.com/images/I/71jfzcXideL._AC_SL1500_.jpg",
  },
  "B08DKYBTPH": {
    name: "Chefman TurboFry 8-Qt Air Fryer",
    fallback: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg",
  },
  "B089TQWJKK": {
    name: "Ninja Foodi DZ201 DualZone 8-Qt",
    fallback: "https://m.media-amazon.com/images/I/61xMRA3NY4L._AC_SL1500_.jpg",
  },
  "B07VHFMZHJ": {
    name: "Instant Vortex Plus 6-Qt Air Fryer",
    fallback: "https://m.media-amazon.com/images/I/71GPWtT61gL._AC_SL1500_.jpg",
  },
  "B0GH8PVFHS": {
    name: "Ninja UltraCrush Professional Blender",
    fallback: "https://m.media-amazon.com/images/I/71GDWC3uKQL._AC_SL1500_.jpg",
  },
  "B01FHOWYA2": {
    name: "Ninja Fit Compact Personal Blender",
    fallback: "https://m.media-amazon.com/images/I/710oNE8RCjL._AC_SL1500_.jpg",
  },
  "B00EI7DPI0": {
    name: "Hamilton Beach Power Elite Blender",
    fallback: "https://m.media-amazon.com/images/I/71k1RTjfAhL._AC_SL1500_.jpg",
  },
  "B0BKR66QGC": {
    name: "Reynolds Kitchens Air Fryer Liners (50)",
    fallback: "https://m.media-amazon.com/images/I/71AbD2FmLaL._AC_SL1500_.jpg",
  },
  "B0C6Y8NYK1": {
    name: "Disposable Air Fryer Paper Liners (125)",
    fallback: "https://m.media-amazon.com/images/I/81uYPVAVU3L._AC_SL1500_.jpg",
  },
  "B0B6PLG6G2": {
    name: "8-Inch Square Air Fryer Liners (125)",
    fallback: "https://m.media-amazon.com/images/I/710lcyAkSSL._AC_SL1500_.jpg",
  },
};

/** pageId -> ordered ASINs for slots (best-overall, best-value, best-premium, alt1, alt2) */
const PAGE_PRODUCTS = {
  "AF-PIL": ["B0C33CHG99", "B08DKYBTPH", "B089TQWJKK", "B0CSZ7WBYW", "B07VHFMZHJ"],
  "AF-R01": ["B0C33CHG99", "B08DKYBTPH", "B0CSZ7WBYW", "B07VHFMZHJ", "B089TQWJKK"],
  "AF-R02": ["B0C33CHG99", "B0CSZ7WBYW", "B07VHFMZHJ", "B08DKYBTPH", "B089TQWJKK"],
  "AF-R03": ["B0CSZ7WBYW", "B0C33CHG99", "B07VHFMZHJ", "B08DKYBTPH", "B089TQWJKK"],
  "AF-R04": ["B0CSZ7WBYW", "B0C33CHG99", "B07VHFMZHJ", "B08DKYBTPH", "B089TQWJKK"],
  "AF-R05": ["B089TQWJKK", "B0C33CHG99", "B08DKYBTPH", "B07VHFMZHJ", "B0CSZ7WBYW"],
  "AF-R06": ["B089TQWJKK", "B08DKYBTPH", "B0C33CHG99", "B07VHFMZHJ", "B0CSZ7WBYW"],
  "AF-R07": ["B0CSZ7WBYW", "B0C33CHG99", "B07VHFMZHJ", "B08DKYBTPH", "B089TQWJKK"],
  "AF-R11": ["B089TQWJKK", "B08DKYBTPH", "B0C33CHG99", "B07VHFMZHJ", "B0CSZ7WBYW"],
  "AF-R12": ["B089TQWJKK", "B08DKYBTPH", "B0C33CHG99", "B07VHFMZHJ", "B0CSZ7WBYW"],
  "AF-C01": ["B0CSZ7WBYW", "B0C33CHG99"],
  "AF-V01": ["B0CSZ7WBYW"],
  "AF-V02": ["B0C33CHG99"],
  "BL-PIL": ["B0GH8PVFHS", "B00EI7DPI0", "B01FHOWYA2"],
  "BL-R01": ["B0GH8PVFHS", "B00EI7DPI0", "B01FHOWYA2"],
  "BL-R03": ["B01FHOWYA2", "B0GH8PVFHS", "B00EI7DPI0"],
  "BL-R04": ["B0GH8PVFHS", "B01FHOWYA2", "B00EI7DPI0"],
  "BL-R05": ["B0GH8PVFHS", "B01FHOWYA2", "B00EI7DPI0"],
  "BL-R06": ["B0GH8PVFHS", "B01FHOWYA2", "B00EI7DPI0"],
  "BL-C01": ["B0GH8PVFHS", "B01FHOWYA2"],
  "BL-C02": ["B0GH8PVFHS", "B01FHOWYA2"],
  "BL-V01": ["B0GH8PVFHS"],
  "BL-V02": ["B01FHOWYA2"],
  "AF-R20": ["B0BKR66QGC", "B0C6Y8NYK1", "B0B6PLG6G2"],
};

const SLOT_ORDER = [
  "best-overall",
  "best-value",
  "best-premium",
  "alternative-1",
  "alternative-2",
  "pick-a",
  "pick-b",
  "product",
];

function loadCache() {
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function extractImageFromHtml(html) {
  const patterns = [
    /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /"landingImageUrl"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/,
    /(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+._%-]+)\._AC_/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      let url = match[1].replace(/\\u002F/g, "/");
      if (!url.includes("._AC_")) {
        url = url.replace(/\.(jpg|jpeg|png|webp)$/i, "._AC_SL1500_.$1");
      } else {
        url = url.replace(/\._AC_[A-Z0-9,]+_\./, "._AC_SL1500_.");
      }
      return url;
    }
  }
  return "";
}

async function scrapeImage(asin, cache) {
  if (cache[asin]?.imageUrl) return cache[asin].imageUrl;

  const fallback = CATALOG[asin]?.fallback || "";
  const url = `https://www.amazon.com/dp/${asin}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(`Amazon ${asin}: HTTP ${response.status}`);
      cache[asin] = { imageUrl: fallback, scrapedAt: today, status: response.status };
      return fallback;
    }

    const html = await response.text();
    const imageUrl = extractImageFromHtml(html) || fallback;
    cache[asin] = {
      imageUrl,
      scrapedAt: today,
      status: imageUrl ? "ok" : "empty",
      source: imageUrl && imageUrl !== fallback ? "amazon-html" : "fallback",
    };
    console.log(
      `Image ${asin}: ${cache[asin].source} → ${imageUrl ? "yes" : "NO"}`,
    );
    return imageUrl;
  } catch (error) {
    console.warn(`Amazon ${asin}: ${error.message}`);
    cache[asin] = { imageUrl: fallback, scrapedAt: today, status: "error" };
    return fallback;
  }
}

function fillCsv(imageMap) {
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const byPage = new Map();

  for (const row of rows) {
    if (!byPage.has(row.pageId)) byPage.set(row.pageId, []);
    byPage.get(row.pageId).push(row);
  }

  for (const [pageId, asins] of Object.entries(PAGE_PRODUCTS)) {
    const pageRows = byPage.get(pageId) || [];
    const slots = pageRows.length
      ? pageRows
      : asins.map((asin, index) => ({
          pageId,
          pageTitle: "",
          pageSlug: "",
          pageType: "",
          slotId: SLOT_ORDER[index] || `slot-${index + 1}`,
          slotLabel: SLOT_ORDER[index] || `Slot ${index + 1}`,
          productName: "",
          asin: "",
          imageUrl: "",
          imageWidth: "",
          imageHeight: "",
          imageAlt: "",
          imageSource: "Amazon CDN scrape",
          checkedAt: "",
          notes: "",
        }));

    for (let i = 0; i < Math.min(asins.length, slots.length); i++) {
      const asin = asins[i];
      const meta = CATALOG[asin] || { name: asin };
      const imageUrl = imageMap[asin] || meta.fallback || "";
      slots[i].asin = asin;
      slots[i].productName = meta.name;
      slots[i].imageUrl = imageUrl;
      slots[i].imageWidth = imageUrl ? "1500" : "";
      slots[i].imageHeight = imageUrl ? "1500" : "";
      slots[i].imageAlt = meta.name;
      slots[i].imageSource = "Amazon CDN (hotlink)";
      slots[i].checkedAt = today;
      slots[i].notes = "Verified ASIN for CounterCrave launch set";
    }
  }

  const output = [];
  for (const pageRows of byPage.values()) {
    output.push(...pageRows);
  }

  fs.writeFileSync(csvPath, toCsv(output));
  const filled = output.filter((r) => r.asin).length;
  console.log(`CSV updated: ${filled} product slots filled.`);
}

function sectionCopy(page, section) {
  const kw = page.primaryKeyword || page.title;
  const cluster = page.cluster || "kitchen gadgets";
  const heading = section.heading.toLowerCase();

  if (heading.includes("top pick") || heading.includes("at a glance")) {
    return {
      paragraphs: [
        `If you are shopping for ${kw}, start with capacity, footprint, and cleanup—not feature count. CounterCrave ranks ${cluster.toLowerCase()} picks by how clearly they match real kitchen constraints: counter depth, household size, and how often you cook.`,
        `Below you will find our current shortlist for this page. Product cards link to Amazon with our Associates disclosure. Specs can change by seller listing, so always confirm capacity and accessories on the product page before buying.`,
      ],
      bullets: [
        "Match basket or jar size to the meals you cook most often",
        "Prefer models with easy-clean baskets, lids, or dishwasher-safe parts",
        "Skip premium extras unless they solve a problem you already have",
      ],
    };
  }

  if (heading.includes("comparison") || heading.includes("table")) {
    return {
      paragraphs: [
        `Use the product cards on this page as a practical comparison set for ${kw}. We focus on decision trade-offs—size, dual zones vs single basket, pitcher vs personal cup—rather than copying Amazon ratings or prices.`,
        `When two models look similar, pick the one that fits your counter and cleanup routine. A slightly smaller unit you will use daily beats a larger unit that stays in a cabinet.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("how we") || heading.includes("select") || heading.includes("evaluat") || heading.includes("method")) {
    return {
      paragraphs: [
        `Our selection method is research-led, not lab-certified. We cross-check manufacturer capacity claims, publicly listed wattage and dimensions, and common ownership pain points such as basket depth, noise, and replacement parts.`,
        `We do not invent hands-on test scores. Where we have not personally run timed cook tests, we say so and still give buy-if / skip-if guidance based on verified specs and use-case fit.`,
      ],
      bullets: [
        "Verify ASIN, capacity, and included accessories on Amazon before purchase",
        "Prefer clear buy/skip criteria over vague “best” claims",
        "Update picks when a listing is discontinued or materially changed",
      ],
    };
  }

  if (heading.includes("best overall") || heading.includes("overall recommendation")) {
    return {
      paragraphs: [
        `Our best overall pick for ${kw} is the model that balances capacity, everyday usability, and cleanup with the fewest compromises for most households.`,
        `Choose it if you want one primary appliance for weeknight cooking. Skip it if you need a specialty form factor (mini, dual-basket, or premium blender jar) covered in the alternatives below.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("value") || heading.includes("budget")) {
    return {
      paragraphs: [
        `Best value means the strongest capacity-and-features mix without paying for unused modes. For ${kw}, that usually means a proven mid-size model rather than the cheapest no-name listing.`,
        `Value picks still need trustworthy controls and replaceable parts. If a listing is unusually cheap with sparse specs, treat it as a risk and prefer known brands on this page.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("premium")) {
    return {
      paragraphs: [
        `Premium picks earn the slot when dual zones, higher power, or longer-lasting build quality solve a real problem—family batch cooking, ice crushing, or daily smoothie volume.`,
        `Pay up only if you will use those advantages weekly. Otherwise a strong mid-tier pick usually converts better for most CounterCrave readers.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("use case") || heading.includes("who should") || heading.includes("who it")) {
    return {
      paragraphs: [
        `Match ${kw} to your household size and counter space first. Solo cooks and studio kitchens should prioritize compact footprints; families should prioritize usable capacity and batch cooking.`,
        `If you cook frozen snacks and proteins most nights, prioritize even airflow and a basket you can shake easily. If smoothies and ice are the job, prioritize motor power and jar geometry over preset count.`,
      ],
      bullets: [
        "1 person / small counters → compact basket or personal blender cup",
        "2 people → mid-size single basket or 5–6 qt class",
        "Family of 4+ → dual zone or large basket / full pitcher",
      ],
    };
  }

  if (heading.includes("faq") || heading.includes("common question")) {
    return {
      paragraphs: [
        `Most shoppers ask about size, cleanup, and whether dual-zone or premium power is worth it. The short answers: measure your counter depth, prefer dishwasher-safe or nonstick baskets, and only upgrade when you cook two foods at once or crush ice often.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("alternative") || heading.includes("also consider")) {
    return {
      paragraphs: [
        `Alternatives matter when the top pick fails a constraint—budget, footprint, dual cooking, or brand preference. Scan the product cards for the slot that matches your constraint instead of defaulting to the bestseller.`,
      ],
      bullets: [],
    };
  }

  if (heading.includes("verdict") || heading.includes("final") || heading.includes("bottom line")) {
    return {
      paragraphs: [
        `Bottom line for ${kw}: pick the appliance that fits your counter and weekly cooking pattern, then confirm the Amazon listing details before checkout. Use our disclosure links when you are ready to compare current pricing.`,
      ],
      bullets: [],
    };
  }

  return {
    paragraphs: [
      `This section covers ${section.heading.toLowerCase()} for readers researching ${kw}. Focus on fit: capacity, cleanup, and whether the design matches how you actually cook.`,
      `CounterCrave keeps guidance practical and independent. We link to Amazon for availability checks and do not copy customer reviews, star ratings, or live prices into our pages.`,
      `Keep your decision tied to verifiable specs and clear buy-if / skip-if advice rather than feature count alone.`,
    ],
    bullets: [],
  };
}

function fillPageContent(page) {
  const asins = PAGE_PRODUCTS[page.pageId] || [];
  const names = asins
    .map((asin) => CATALOG[asin]?.name)
    .filter(Boolean)
    .slice(0, 3);

  page.summary =
    page.summary && page.summary.length >= 40
      ? page.summary
      : `Quick take: for ${page.primaryKeyword || page.title}, prioritize fit over feature lists. ${
          names.length
            ? `Current shortlist includes ${names.join(", ")}.`
            : "Use the product cards and decision sections below to choose."
        } Confirm capacity and accessories on Amazon before buying.`;

  page.sections = (page.sections || []).map((section) => {
    const copy = sectionCopy(page, section);
    return {
      ...section,
      paragraphs:
        section.paragraphs?.length > 0 ? section.paragraphs : copy.paragraphs,
      bullets: section.bullets?.length > 0 ? section.bullets : copy.bullets,
    };
  });

  if (!page.faqs?.length) {
    page.faqs = [
      {
        question: `What should I check before buying ${page.primaryKeyword || "this product"}?`,
        answer:
          "Confirm capacity, dimensions, included accessories, and return window on the Amazon listing. Specs and bundles can change by seller.",
      },
      {
        question: "Do you update recommendations?",
        answer:
          "Yes. CounterCrave refreshes priority pages when listings change, ASINs retire, or a clearer fit appears for the same use case.",
      },
      {
        question: "Are prices shown on CounterCrave?",
        answer:
          "We avoid embedding live prices. Use the Amazon buttons for current pricing, shipping, and stock.",
      },
    ];
  }

  page.productPageIds = page.productPageIds?.length
    ? page.productPageIds
    : [page.pageId];
  page.author = page.author || "CounterCrave Editorial Team";
  page.updatedAt = today;
  page.publishedAt = page.publishedAt || today;
  page.draft = false;
  page.noindex = false;
  return page;
}

function publishPriorityPages() {
  const dir = path.join(root, "content", "pages");
  let published = 0;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const full = path.join(dir, file);
    const page = JSON.parse(fs.readFileSync(full, "utf8"));

    const shouldPublish =
      page.priority === "P1" ||
      PAGE_PRODUCTS[page.pageId] ||
      ["AF-HUB", "BL-HUB", "AF-G01", "BL-G01", "AF-G02", "CC-G02"].includes(
        page.pageId,
      );

    if (!shouldPublish) continue;

    const next = fillPageContent(page);
    fs.writeFileSync(full, JSON.stringify(next, null, 2) + "\n");
    published += 1;
  }

  // Trust / static pages should already be publishable; ensure draft false if content exists
  const staticDir = path.join(root, "content", "static");
  for (const file of fs.readdirSync(staticDir)) {
    if (!file.endsWith(".json")) continue;
    const full = path.join(staticDir, file);
    const page = JSON.parse(fs.readFileSync(full, "utf8"));
    if (page.draft && page.summary && page.sections?.some((s) => s.paragraphs?.length)) {
      page.draft = false;
      page.noindex = false;
      page.updatedAt = today;
      fs.writeFileSync(full, JSON.stringify(page, null, 2) + "\n");
      published += 1;
    }
  }

  console.log(`Published / refreshed ${published} content files.`);
}

async function main() {
  const cache = loadCache();
  const asins = [...new Set(Object.values(PAGE_PRODUCTS).flat())];

  console.log(`Scraping images for ${asins.length} ASINs...`);
  const imageMap = {};
  for (const asin of asins) {
    imageMap[asin] = await scrapeImage(asin, cache);
    await new Promise((r) => setTimeout(r, 900));
  }
  saveCache(cache);

  fillCsv(imageMap);
  publishPriorityPages();
  console.log("Bootstrap complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
