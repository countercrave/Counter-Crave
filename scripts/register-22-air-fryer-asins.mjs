import fs from "node:fs";
import path from "node:path";

const expandScriptPath = path.join(process.cwd(), "scripts", "expand-max-products.mjs");
let code = fs.readFileSync(expandScriptPath, "utf8");

const products22 = [
  {
    asin: "B08R6KMBQT",
    name: "Instant Pot 4QT Vortex Plus 6-in-1 Mini Air Fryer",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71XyGxT1ITL._AC_SL1500_.jpg",
    bestFor: "Best overall for two",
    shortVerdict: "4-quart capacity is well matched to two servings with 6 cooking functions and a compact footprint.",
    score: 9.2,
    keySpecs: ["4 qt capacity", "6-in-1 functions", "Custom program options", "Stainless steel trim"],
    pros: ["4-quart capacity is well matched to two servings", "Six cooking functions add useful versatility", "Compact format is easier to keep on the counter"],
    cons: ["No viewing window", "May require batching for very large portions"],
    buyIf: "You want a compact 4-quart air fryer tailored for 2 people.",
    skipIf: "You cook large batch meals or want a viewing window."
  },
  {
    asin: "B0CNY1F31S",
    name: "Chefman Air Fryer 4 QT Compact",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71Ld+1SBc5L._AC_SL1500_.jpg",
    bestFor: "Best budget-size pick",
    shortVerdict: "Straightforward 4-quart option with Hi-Fry 450°F crisping mode and simple touchscreen presets.",
    score: 9.0,
    keySpecs: ["4 qt capacity", "Hi-Fry 450°F tech", "4 presets", "Dishwasher safe basket"],
    pros: ["Couple-friendly 4-quart basket", "450°F Hi-Fry feature for extra crisping", "Dishwasher-safe basket"],
    cons: ["Only four presets", "Less cooking space than 5-6 qt models"],
    buyIf: "You want an affordable 4-quart air fryer with high heat capability.",
    skipIf: "You want more advanced presets or larger capacity."
  },
  {
    asin: "B0D98WLVTB",
    name: "Cuisinart Air Fryer 2.6-Quart Compact (AIR-80)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/719OkHTmcWL._AC_SL1500_.jpg",
    bestFor: "Best compact air fryer",
    shortVerdict: "Ultra-compact 2.6-quart basket fryer for small portions, vegetables, or tight counter spaces.",
    score: 8.8,
    keySpecs: ["2.6 qt capacity", "3 cooking functions", "3 presets", "Dishwasher-safe parts"],
    pros: ["Very compact 2.6-quart capacity", "Air fry, roast and bake functions", "Dishwasher-safe parts"],
    cons: ["Tight for a full main-and-side dinner", "More likely to need two batches"],
    buyIf: "You have minimal counter space and cook small portions for 1-2 people.",
    skipIf: "You regularly cook full two-person meals at once."
  },
  {
    asin: "B0CSZ7WBYW",
    name: "Ninja Air Fryer Pro 5 Qt (AF141)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71jfzcXideL._AC_SL1500_.jpg",
    bestFor: "Best 5-quart simple pick",
    shortVerdict: "5-quart capacity leaves room for larger portions without jumping to an oversized dual-drawer machine.",
    score: 9.3,
    keySpecs: ["5 qt capacity", "1750W power", "400°F max temp", "Nonstick basket"],
    pros: ["5-quart capacity leaves room for larger portions", "Four everyday cooking modes", "Dishwasher-safe nonstick basket"],
    cons: ["No window in the listing", "400°F maximum is lower than several 450°F rivals"],
    buyIf: "You want a dependable 5-quart Ninja basket air fryer.",
    skipIf: "You require 450°F high heat or a viewing window."
  },
  {
    asin: "B0936FGLQS",
    name: "Cosori Air Fryer Pro LE 5 Qt",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71jSDZe54mL._AC_SL1500_.jpg",
    bestFor: "Best 5-quart control set",
    shortVerdict: "Feature-rich 5-quart model with shake reminder, ceramic coating, and 450°F max temp.",
    score: 9.3,
    keySpecs: ["5 qt capacity", "450°F max temp", "Shake reminder", "Ceramic coating"],
    pros: ["5-quart couple-friendly capacity", "Shake reminder for even cooking", "Ceramic coating"],
    cons: ["More controls than minimalist users need"],
    buyIf: "You want a sleek 5-quart air fryer with high heat and shake alerts.",
    skipIf: "You prefer ultra-simple analog or 1-touch controls."
  },
  {
    asin: "B0GVPBSXXF",
    name: "Cuisinart Air Fryer Glass Basket 4 Qt (AFC-4)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71m2lPJozaL._AC_SL1500_.jpg",
    bestFor: "Best glass-basket option",
    shortVerdict: "Glass basket and ClearView window allow monitoring browning without pulling the basket.",
    score: 9.1,
    keySpecs: ["4 qt capacity", "Glass basket & ClearView", "450°F max temp", "5 cooking functions"],
    pros: ["4-quart size fits two-person cooking well", "Glass basket and viewing window", "Heats to 450°F per listing"],
    cons: ["Premium price point", "Glass components are heavier than aluminum"],
    buyIf: "You prefer a glass basket to watch food brown clearly.",
    skipIf: "You want a lightweight basket or budget price point."
  },
  {
    asin: "B0C33CHG99",
    name: "Cosori TurboBlaze Air Fryer 6 Qt",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81R9sA3IyBL._AC_SL1500_.jpg",
    bestFor: "Best premium single basket",
    shortVerdict: "Roomy 6-quart single basket with 5 fan speeds and PFAS-free ceramic nonstick coating.",
    score: 9.4,
    keySpecs: ["6 qt capacity", "5 fan speeds", "450°F max temp", "PFAS-free ceramic"],
    pros: ["450°F maximum heat with 5 fan speeds", "PFAS-free ceramic coating", "Roomy single basket for meal prep"],
    cons: ["Larger than many couples strictly need", "Takes more counter space than 4-5 qt models"],
    buyIf: "You want high-end performance, ceramic nonstick, and extra space for meal prep.",
    skipIf: "Counter space is tightly constrained."
  },
  {
    asin: "B096N3FTZP",
    name: "Instant Pot Vortex Plus 6QT ClearCook",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71QM4TEKo8L._AC_SL1500_.jpg",
    bestFor: "Best 6-quart with window",
    shortVerdict: "6-quart ClearCook model with see-through window and 6-in-1 custom programs.",
    score: 9.2,
    keySpecs: ["6 qt capacity", "ClearCook window", "6-in-1 functions", "Custom presets"],
    pros: ["ClearCook viewing window", "Six cooking functions", "Room for larger two-person meals"],
    cons: ["Bigger footprint than 4-quart models"],
    buyIf: "You want a 6-quart air fryer with a clear window for easy monitoring.",
    skipIf: "You prefer a smaller 4-quart size."
  },
  {
    asin: "B089TQWJKK",
    name: "Ninja DZ201 Foodi 8 Quart DualZone",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/61xMRA3NY4L._AC_SL1500_.jpg",
    bestFor: "Best dual-basket pick",
    shortVerdict: "Two independent 4-quart zones let you cook mains and sides at different settings simultaneously.",
    score: 9.4,
    keySpecs: ["8 qt total (dual 4 qt)", "Smart Finish & Match Cook", "6-in-1 functions", "Independent controls"],
    pros: ["Two independent 4-quart baskets", "Smart Finish and Match Cook", "Can cook main and side at different settings"],
    cons: ["Wider than a single-basket fryer", "More parts to clean"],
    buyIf: "You regularly cook a main and side that require different times or temperatures.",
    skipIf: "Most of your meals fit in a single basket."
  },
  {
    asin: "B0D4RDV53M",
    name: "Ninja Air Fryer DoubleStack 8 Qt (SL201)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/51oNOzuO5tL._AC_SL1500_.jpg",
    bestFor: "Best space-conscious dual basket",
    shortVerdict: "Vertical stacked dual-basket layout provides 2-zone cooking flexibility with a narrower footprint.",
    score: 9.1,
    keySpecs: ["8 qt total (stacked)", "Smart Finish & Match Cook", "Cooks 4 foods at once", "Space-saving vertical design"],
    pros: ["Two-zone cooking flexibility", "Smart Finish and Match Cook", "Stacked design reduces counter-width demand"],
    cons: ["Still an 8-quart appliance", "Higher price point"],
    buyIf: "You want dual-zone cooking without sacrificing counter width.",
    skipIf: "You prefer a simple single-basket model."
  },
  {
    asin: "B0GK7JKF53",
    name: "Typhur Sync Oven 27QT",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/91CVC-AjtwL._AC_SL1500_.jpg",
    bestFor: "Best air-fryer toaster oven",
    shortVerdict: "Massive 27-quart 12-in-1 countertop oven with wireless meat thermometer probe for full meal baking and roasting.",
    score: 9.5,
    keySpecs: ["27 qt capacity", "Wireless meat probe", "360° Turbo Convection", "12-in-1 functions"],
    pros: ["Includes smart wireless probe", "Huge 27QT capacity replaces wall oven", "12-in-1 versatility"],
    cons: ["Very large counter footprint", "Higher price point"],
    buyIf: "You want a full countertop oven replacement with smart probe integration.",
    skipIf: "You only need a quick compact basket fryer."
  },
  {
    asin: "B081B21KGS",
    name: "Amazon Basics 2.1-Qt Electric Deep Fryer",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81mJmlF1JXL._AC_SL1500_.jpg",
    bestFor: "Deep fryer (Source list comparison)",
    shortVerdict: "Electric deep fryer for oil cooking; included for completeness from source data.",
    score: 7.5,
    keySpecs: ["2.1 qt oil capacity", "1500W power", "Viewing window", "Removable basket"],
    pros: ["Compact oil fryer", "Viewing window"],
    cons: ["Requires cooking oil, not an air fryer"],
    buyIf: "You explicitly want an oil deep fryer.",
    skipIf: "You want oil-free air frying."
  },
  {
    asin: "B0BNDJN73L",
    name: "Gourmia Air Fryer 14 Qt Rotisserie Oven",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81rKFilWWpL._AC_SL1500_.jpg",
    bestFor: "Best oven-style value",
    shortVerdict: "14-quart rotisserie oven with digital display and 12 presets for roasting, baking, and dehydrating.",
    score: 8.9,
    keySpecs: ["14 qt capacity", "Rotisserie spit & basket", "12 presets", "Stainless steel finish"],
    pros: ["Rotisserie feature", "14QT oven-style capacity", "Budget-friendly for an oven combo"],
    cons: ["Large footprint", "Oven racks require more washing"],
    buyIf: "You want rotisserie capability and an oven-style layout at a reasonable price.",
    skipIf: "You prefer a simple pull-out basket."
  },
  {
    asin: "B08DKYBTPH",
    name: "Chefman Air Fryer 8 Qt TurboFry",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg",
    bestFor: "Best 8-quart single basket",
    shortVerdict: "XL 8-quart single basket with 450°F Hi-Fry option for crisping larger batches.",
    score: 8.8,
    keySpecs: ["8 qt capacity", "450°F Hi-Fry mode", "Nonstick basket", "Stainless steel accents"],
    pros: ["Large 8-quart single basket", "450°F Hi-Fry option"],
    cons: ["Overkill for small 2-person meals"],
    buyIf: "You cook large single-basket batches or meal prep for the week.",
    skipIf: "You want a compact daily fryer."
  },
  {
    asin: "B096X9LGJ1",
    name: "Ninja DZ401 Foodi 10 Quart DualZone XL",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/61A3ePViuoL._AC_SL1500_.jpg",
    bestFor: "Best XL dual basket",
    shortVerdict: "Extra-large dual-basket system with two 5-quart baskets for high-volume dual cooking.",
    score: 9.3,
    keySpecs: ["10 qt total (dual 5 qt)", "Match Cook & Smart Finish", "6-in-1 functions", "IQ Boost"],
    pros: ["Two 5-quart baskets", "Ideal for hosting or big meal preps"],
    cons: ["Very wide counter footprint"],
    buyIf: "You regularly host or batch-cook 2 distinct foods in large quantities.",
    skipIf: "Counter width is limited."
  },
  {
    asin: "B0FJSDQRR8",
    name: "Philips 3000 Series Dual Basket 9.5 Qt",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/51IkTA86BPL._AC_SL1500_.jpg",
    bestFor: "Best premium large dual basket",
    shortVerdict: "Premium Philips dual basket with RapidAir airflow technology and Auto-Sync finish timing.",
    score: 9.0,
    keySpecs: ["9.5 qt total", "RapidAir technology", "Auto-Sync finish", "8 cooking modes"],
    pros: ["RapidAir technology for crisping", "Auto-Sync finish timing"],
    cons: ["Premium price point", "Large footprint"],
    buyIf: "You want Philips RapidAir tech in a dual-basket system.",
    skipIf: "You are on a tight budget."
  },
  {
    asin: "B0FZF445YL",
    name: "Chefman Air Fryer 9 Qt TurboFry",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81TNVH2j5FL._AC_SL1500_.jpg",
    bestFor: "Best large Chefman with window",
    shortVerdict: "9-quart single basket with viewing window, 450°F max temp, and 7 presets.",
    score: 8.9,
    keySpecs: ["9 qt capacity", "Viewing window", "450°F max temp", "7-in-1 functions"],
    pros: ["Viewing window on 9-quart basket", "450°F max heat"],
    cons: ["Very large basket for 2 people"],
    buyIf: "You want a large 9-quart basket with a viewing window.",
    skipIf: "You want a small couple-sized fryer."
  },
  {
    asin: "B0CS3V8M9H",
    name: "Ninja Air Fryer XL MaxCrisp 6.5 Qt (AF181)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/719F0KSYZqL._AC_SL1500_.jpg",
    bestFor: "Best for extra-crisp large batches",
    shortVerdict: "6.5-quart single-basket Ninja featuring 450°F MaxCrisp tech for frozen foods and wings.",
    score: 9.2,
    keySpecs: ["6.5 qt capacity", "450°F MaxCrisp", "1750W power", "6-in-1 functions"],
    pros: ["450°F MaxCrisp mode", "Fits up to 9 lbs of wings"],
    cons: ["Larger than needed for basic 2-person dinners"],
    buyIf: "You cook a lot of frozen foods or wings that need max crisping heat.",
    skipIf: "A 4-quart model meets your needs."
  },
  {
    asin: "B0H1V9VYSY",
    name: "Beelicious Large AirFryer Machine 5.8Qt",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71e7GAUBDdL._AC_SL1500_.jpg",
    bestFor: "Best windowed value alternative",
    shortVerdict: "5.8-quart air fryer with viewing window, shake reminder, and 12-in-1 presets.",
    score: 9.1,
    keySpecs: ["5.8 qt capacity", "Clear window", "Shake reminder", "12-in-1 digital"],
    pros: ["Viewing window", "5.8-quart capacity", "Shake reminder"],
    cons: ["Brand is less established than Ninja/Cosori"],
    buyIf: "You want a 5.8-quart windowed fryer with lots of presets.",
    skipIf: "You prefer major brand name support."
  },
  {
    asin: "B0CNY1YVDD",
    name: "Chefman Air Fryer 6 QT Compact",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71WCBoDBHsL._AC_SL1500_.jpg",
    bestFor: "Best roomy Chefman for two",
    shortVerdict: "Practical 6-quart step up from 4-quart Chefman for couples who want extra space for larger proteins.",
    score: 9.1,
    keySpecs: ["6 qt capacity", "Hi-Fry 450°F tech", "Touchscreen controls", "Dishwasher safe"],
    pros: ["Roomy 6-quart basket", "450°F Hi-Fry capability"],
    cons: ["Simple 4 presets"],
    buyIf: "You want a 6-quart Chefman with Hi-Fry 450°F heat.",
    skipIf: "You prefer a 4-quart compact footprint."
  },
  {
    asin: "B0F9B4YCZF",
    name: "Instant Pot 4Qt Vortex 6-in-1 Mini Air Fryer Black",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71uH9rgfwLL._AC_SL1500_.jpg",
    bestFor: "Best alternate 4-quart Instant",
    shortVerdict: "Compact 4-quart Instant Vortex in black finish, with 6-in-1 custom programs.",
    score: 9.2,
    keySpecs: ["4 qt capacity", "6-in-1 functions", "Black finish", "Dishwasher safe tray"],
    pros: ["Classic 4-quart capacity for two", "6 cooking functions"],
    cons: ["No viewing window"],
    buyIf: "You want a 4-quart Instant Vortex in all-black finish.",
    skipIf: "You want stainless steel accents or a window."
  },
  {
    asin: "B0CCS2TH8Q",
    name: "Cosori Dual Air Fryer 9QT",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/81zJWuKQG3L._AC_SL1500_.jpg",
    bestFor: "Best large dual-zone Cosori",
    shortVerdict: "Dual 4.5-quart baskets with 10-in-1 functions, Sync Cook & Finish, and 450°F max heat.",
    score: 9.3,
    keySpecs: ["9 qt total (dual 4.5 qt)", "450°F max heat", "Sync Cook & Finish", "10-in-1 functions"],
    pros: ["Two 4.5-quart independent baskets", "450°F max heat capability"],
    cons: ["Large counter width required"],
    buyIf: "You want dual 4.5-quart baskets with 450°F crisping.",
    skipIf: "You have limited counter space."
  }
];

// Add missing ASINs into CATALOG in expand-max-products.mjs
for (const p of products22) {
  if (!code.includes(`${p.asin}:`)) {
    const entry = `  ${p.asin}: ${JSON.stringify(p, null, 4)},\n`;
    code = code.replace("const CATALOG = {", `const CATALOG = {\n${entry}`);
    console.log(`Added ${p.asin} (${p.name}) to CATALOG.`);
  }
}

// Ensure AF-R04 in PAGE_OVERRIDES has all 22 ASINs
const asinsList = products22.map((p) => `"${p.asin}"`).join(",\n    ");
const afR04Override = `  "AF-R04": [\n    ${asinsList}\n  ],`;

if (code.includes('"AF-R04": AF,')) {
  code = code.replace('"AF-R04": AF,', afR04Override);
  console.log("Updated AF-R04 PAGE_OVERRIDES with all 22 ASINs!");
} else if (code.includes('"AF-R04": [')) {
  code = code.replace(/"AF-R04":\s*\[[^\]]+\]\s*,?/, afR04Override);
  console.log("Replaced AF-R04 PAGE_OVERRIDES with full 22 ASINs!");
}

fs.writeFileSync(expandScriptPath, code, "utf8");
console.log("Successfully registered all 22 ASINs in expand-max-products.mjs!");
