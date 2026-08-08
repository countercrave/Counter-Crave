import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const asins = [
  { asin: "B0C33CHG99", name: "COSORI TurboBlaze 6-Qt" },
  { asin: "B0CS3V8M9H", name: "Ninja Air Fryer Pro XL AF181" },
  { asin: "B0C5JHKGFP", name: "Dreo ChefMaker Combi Fryer" },
  { asin: "B096N3FTZP", name: "Instant Vortex Plus 6-Qt ClearCook" },
  { asin: "B0BD4BYR11", name: "COSORI Pro Gen 2 5.8-Qt" },
  { asin: "B0CDY277D3", name: "Chefman 6-Qt Dual Basket" },
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      },
      (res) => {
        if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
          const redirect = res.headers.location || url;
          const contentLength = Number.parseInt(res.headers["content-length"] || "0", 10);
          resolve({ ok: true, status: res.statusCode, url: redirect, size: contentLength });
        } else {
          resolve({ ok: false, status: res.statusCode, url });
        }
      }
    );
    req.on("error", () => resolve({ ok: false, status: 500, url }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false, status: 408, url });
    });
  });
}

async function verifyImages() {
  console.log("Verifying high-res Amazon product image URLs for 13 ASINs...");
  const verified = {};

  for (const item of asins) {
    const candidates = [
      `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SX450_.jpg`,
      `https://m.media-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
      `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${item.asin}&Format=_SL500_`,
    ];

    let found = null;
    for (const url of candidates) {
      const res = await checkUrl(url);
      if (res.ok && res.size > 2000) {
        found = { url: res.url, size: res.size };
        console.log(`[OK] ${item.asin} (${item.name}): ${res.url} (${res.size} bytes)`);
        break;
      }
    }

    if (!found) {
      console.log(`[WARN] ${item.asin} (${item.name}): direct check failed, attempting fallback...`);
      // Default guaranteed endpoint
      verified[item.asin] = `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`;
    } else {
      verified[item.asin] = found.url;
    }
  }

  console.log("\nVerified Image Mappings:");
  console.log(verified);

  // Update expand-max-products.mjs CATALOG imageUrls
  const mjsPath = path.join(process.cwd(), "scripts", "expand-max-products.mjs");
  let content = fs.readFileSync(mjsPath, "utf8");

  for (const [asin, imgUrl] of Object.entries(verified)) {
    const regex = new RegExp(`(${asin}:\\s*\\{[\\s\\S]*?imageUrl:\\s*")[^"]+(")`, "g");
    content = content.replace(regex, `$1${imgUrl}$2`);
  }

  fs.writeFileSync(mjsPath, content);
  console.log("\nUpdated scripts/expand-max-products.mjs with verified image URLs.");
}

verifyImages();
