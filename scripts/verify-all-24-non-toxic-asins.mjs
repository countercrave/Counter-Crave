import fs from "node:fs";
import https from "node:https";

const toR09Asins = [
  "B0FM5KF34G", "B0CJMV9RZK", "B0H9LRQ3Q5", "B0F2JN4BFQ", "B0GSGGJ6J9",
  "B0GSB2BBV2", "B09HSWBTN4", "B0GZ2XJR6N", "B0FYMMDDJ9", "B0D1CXL52G",
  "B08BXX69K4", "B0FSJF8ZDJ", "B0H71YVV4F", "B0GWFQKG5J", "B09B7SB46R",
  "B0FZLV3PTV", "B07SCGY2H6", "B0D1BGLW25", "B0D4R8G1FX", "B0C33CHG99",
  "B0BNM16WNZ", "B0FPP4RCV3", "B0B4T992R8", "B0CKLXZRMC"
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

async function verifyAll24() {
  console.log("Verifying all 24 non-toxic toaster oven ASIN image URLs...");
  const resultMap = {};

  for (const asin of toR09Asins) {
    const candidates = [
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX450_.jpg`,
      `https://m.media-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
    ];

    let found = null;
    for (const url of candidates) {
      const res = await checkUrl(url);
      if (res.ok && res.size > 1500) {
        found = res.url;
        console.log(`[OK] ${asin}: ${res.url} (${res.size} bytes)`);
        break;
      }
    }

    if (!found) {
      const fallbackUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
      console.log(`[FALLBACK] ${asin}: ${fallbackUrl}`);
      resultMap[asin] = fallbackUrl;
    } else {
      resultMap[asin] = found;
    }
  }

  console.log("\nVerified 24 ASIN Map:", JSON.stringify(resultMap, null, 2));
}

verifyAll24();
