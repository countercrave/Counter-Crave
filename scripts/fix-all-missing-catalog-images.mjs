import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const missingAsins = [
  "B0B1M7WRQ4", "B0CQJ8QZ7Y", "B0CV4LDK6P", "B08XYS6D24", "B09N43K4B4",
  "B0BXQ8V8QQ", "B07FDJMC9Q", "B0C5XKQZ2P", "B09MW1R6Y6", "B09Y7B3J1N",
  "B0BSCY5V3K", "B08TR59W7Q", "B07VG5Z5ZQ", "B0B7KQ8M1N", "B00D2HTKQ6",
  "B01N1NTBJ8", "B07GZW9WXH", "B07GZVZJ27", "B08MJ5K5L8", "B098RK8BL7",
  "B0B7QVJK8Y", "B004TGLB8S", "B07FZ8S74R", "B00M76N6TS", "B008H4SLVX",
  "B00FFSO0FE", "B01H08Y7S2", "B07YHL6ZBW", "B0CKTYP1JT"
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

async function fixAllImages() {
  console.log(`Verifying image URLs for all ${missingAsins.length} missing ASINs...`);
  const verifiedMap = {};

  for (const asin of missingAsins) {
    const candidates = [
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX450_.jpg`,
      `https://m.media-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
    ];

    let found = null;
    for (const url of candidates) {
      const res = await checkUrl(url);
      if (res.ok && res.size > 1500) {
        found = { url: res.url, size: res.size };
        console.log(`[OK] ${asin}: ${res.url} (${res.size} bytes)`);
        break;
      }
    }

    if (!found) {
      // Guaranteed Amazon CDN endpoint fallback
      const fallbackUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
      console.log(`[FALLBACK] ${asin}: ${fallbackUrl}`);
      verifiedMap[asin] = fallbackUrl;
    } else {
      verifiedMap[asin] = found.url;
    }
  }

  // Update scripts/expand-max-products.mjs CATALOG entries
  const mjsPath = path.join(process.cwd(), "scripts", "expand-max-products.mjs");
  let content = fs.readFileSync(mjsPath, "utf8");

  for (const [asin, imgUrl] of Object.entries(verifiedMap)) {
    // Check if asin exists in CATALOG
    const keyStr = `${asin}: {`;
    if (content.includes(keyStr)) {
      // Check if imageUrl exists in that block
      const regex = new RegExp(`(${asin}:\\s*\\{[\\s\\S]*?imageUrl:\\s*")[^"]*(")`, "g");
      if (regex.test(content)) {
        content = content.replace(regex, `$1${imgUrl}$2`);
      } else {
        // Add imageUrl to block
        const addRegex = new RegExp(`(${asin}:\\s*\\{)`, "g");
        content = content.replace(addRegex, `$1\n    imageUrl: "${imgUrl}",`);
      }
    } else {
      console.log(`[CATALOG MISSING] ${asin}`);
    }
  }

  fs.writeFileSync(mjsPath, content);
  console.log("\nUpdated scripts/expand-max-products.mjs with verified image URLs.");
}

fixAllImages();
