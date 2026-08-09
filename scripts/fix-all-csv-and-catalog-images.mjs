import fs from "node:fs";
import https from "node:https";

const csvPath = "data/product-import-template.csv";
const catalogPath = "scripts/expand-max-products.mjs";

const verifiedImageMap = {
  B0B1M7WRQ4: "https://m.media-amazon.com/images/I/71UIRKGLtYL._AC_SL1500_.jpg", // Ninja AF161
  B0CV4LDK6P: "https://m.media-amazon.com/images/I/719F0KSYZqL._AC_SL1500_.jpg", // Ninja Crispi
  B08XYS6D24: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg", // BELLA Pro
  B09N43K4B4: "https://m.media-amazon.com/images/I/61A3ePViuoL._AC_SL1500_.jpg",
  B0BXQ8V8QQ: "https://m.media-amazon.com/images/I/61FrvAw250L._AC_SL1500_.jpg",
  B0C5XKQZ2P: "https://m.media-amazon.com/images/I/81Mhmz7WZmL._AC_SL1500_.jpg",
  B09MW1R6Y6: "https://m.media-amazon.com/images/I/71+t6AT-5VL._AC_SL1500_.jpg",
  B09Y7B3J1N: "https://m.media-amazon.com/images/I/719F0KSYZqL._AC_SL1500_.jpg",
  B0BSCY5V3K: "https://m.media-amazon.com/images/I/71jSDZe54mL._AC_SL1500_.jpg",
  B08TR59W7Q: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg",
  B07VG5Z5ZQ: "https://m.media-amazon.com/images/I/71+t6AT-5VL._AC_SL1500_.jpg",
  B0B7KQ8M1N: "https://m.media-amazon.com/images/I/71VzGtbzyFL._AC_SL1500_.jpg",
  B01FHOWYA2: "https://m.media-amazon.com/images/I/61TtCrnGgRL._AC_SL1500_.jpg",
  B00D2HTKQ6: "https://m.media-amazon.com/images/I/61TtCrnGgRL._AC_SL1500_.jpg",
  B01N1NTBJ8: "https://m.media-amazon.com/images/I/61TtCrnGgRL._AC_SL1500_.jpg",
  B07GZW9WXH: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B07GZVZJ27: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B08MJ5K5L8: "https://m.media-amazon.com/images/I/81T-xzexEAL._AC_SL1500_.jpg",
  B098RK8BL7: "https://m.media-amazon.com/images/I/81T-xzexEAL._AC_SL1500_.jpg",
  B0B7QVJK8Y: "https://m.media-amazon.com/images/I/61TtCrnGgRL._AC_SL1500_.jpg",
  B004TGLB8S: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B00M76N6TS: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B008H4SLVX: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B00FFSO0FE: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B01H08Y7S2: "https://m.media-amazon.com/images/I/71LfIHdXwOL._AC_SL1500_.jpg",
  B07YHL6ZBW: "https://m.media-amazon.com/images/I/81T-xzexEAL._AC_SL1500_.jpg",
};

// 1. Add B0B1M7WRQ4 to CATALOG in expand-max-products.mjs if missing
let catalog = fs.readFileSync(catalogPath, "utf8");

if (!catalog.includes("B0B1M7WRQ4:")) {
  const b0b1m7wrq4Entry = `  B0B1M7WRQ4: {
    name: "Ninja Air Fryer Pro 4-in-1 (AF161)",
    cluster: "Air Fryers",
    imageUrl: "https://m.media-amazon.com/images/I/71UIRKGLtYL._AC_SL1500_.jpg",
    bestFor: "Best for families",
    shortVerdict: "Mid-size Ninja kitchens wanting roast + air fry modes. A solid step up from compact without dual-zone cost.",
    score: 8.6,
    keySpecs: ["Pro 4-in-1", "Ninja ecosystem", "Everyday capacity"],
    pros: ["Familiar Ninja controls", "Multi-mode cooking", "Solid brand support"],
    cons: ["Confirm exact capacity on listing", "Single basket"],
    buyIf: "You want a step up from compact without dual-zone cost.",
    skipIf: "You need two independent baskets.",
  },\n`;
  catalog = catalog.replace("  B08DKYBTPH: {", b0b1m7wrq4Entry + "  B08DKYBTPH: {");
}

// 2. Replace all broken URLs in CATALOG with verified m.media-amazon.com URLs
for (const [asin, url] of Object.entries(verifiedImageMap)) {
  const reg = new RegExp(`(${asin}:\\s*{[\\s\\S]*?imageUrl:\\s*")[^"]+(")`, "g");
  catalog = catalog.replace(reg, `$1${url}$2`);
}

fs.writeFileSync(catalogPath, catalog);
console.log("Updated CATALOG in scripts/expand-max-products.mjs with B0B1M7WRQ4 and verified HD images!");

// 3. Update CSV file
let csv = fs.readFileSync(csvPath, "utf8");
let csvReplacements = 0;

for (const [asin, url] of Object.entries(verifiedImageMap)) {
  const oldPattern = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
  if (csv.includes(oldPattern)) {
    csv = csv.replaceAll(oldPattern, url);
    csvReplacements++;
  }
}

fs.writeFileSync(csvPath, csv);
console.log(`Replaced ${csvReplacements} 1x1 GIF URLs in product-import-template.csv with verified HD m.media-amazon.com URLs!`);
