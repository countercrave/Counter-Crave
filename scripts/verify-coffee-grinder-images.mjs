import fs from "node:fs";
import https from "node:https";

const asins = [
  { asin: "B005EPRFKO", name: "Hamilton Beach Fresh Grind" },
  { asin: "B0DQ9QDTTS", name: "OXO Brew Compact Conical Burr" },
  { asin: "B07Z8G97PY", name: "BLACK+DECKER One-Touch" },
  { asin: "B08PPGLK8Z", name: "Wancle One-Touch" },
  { asin: "B07WYHQBF2", name: "KRUPS Silent Vortex" },
  { asin: "B00004SPEU", name: "KRUPS Precision 3 oz" },
  { asin: "B003WIZ5PC", name: "KitchenAid BCG111OB" },
  { asin: "B00004S9CX", name: "Cuisinart DCG-20N" },
  { asin: "B09C2FPQXQ", name: "Proctor Silex Sound Shield" },
  { asin: "B0DNJBSMW6", name: "OutIn Fino Portable" },
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
  console.log("Verifying high-res Amazon product image URLs for 10 coffee grinders...");
  for (const item of asins) {
    const candidates = [
      `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SX450_.jpg`,
      `https://m.media-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
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
      console.log(`[WARN] ${item.asin} (${item.name}): direct check failed`);
    }
  }
}

verifyImages();
