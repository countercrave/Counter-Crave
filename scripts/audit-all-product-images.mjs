import fs from "node:fs";
import https from "node:https";
import http from "node:http";

const links = JSON.parse(
  fs.readFileSync("data/product-links.generated.json", "utf8")
);

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) {
      return resolve({ ok: false, status: 0, size: 0, url });
    }
    const client = url.startsWith("https") ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      },
      (res) => {
        const size = Number.parseInt(res.headers["content-length"] || "0", 10);
        resolve({ ok: res.statusCode === 200, status: res.statusCode, size, url });
      }
    );
    req.on("error", () => resolve({ ok: false, status: 500, size: 0, url }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ ok: false, status: 408, size: 0, url });
    });
  });
}

// Deduplicate by ASIN so we only test each unique ASIN once
const asinMap = new Map();
for (const item of links) {
  if (!asinMap.has(item.asin)) {
    asinMap.set(item.asin, item);
  }
}

async function audit() {
  console.log(`Auditing ${asinMap.size} unique ASIN product images across 4,148 slots...`);
  const failedAsins = [];
  const validAsins = [];

  let count = 0;
  for (const [asin, item] of asinMap.entries()) {
    count++;
    const res = await checkUrl(item.imageUrl);
    // An image is valid if HTTP 200 AND size > 5000 bytes (real photo, not 43-byte 1x1 GIF)
    if (res.ok && res.size > 5000) {
      validAsins.push({ asin, name: item.productName, size: res.size, url: item.imageUrl });
    } else {
      failedAsins.push({
        asin,
        pageId: item.pageId,
        name: item.productName,
        status: res.status,
        size: res.size,
        url: item.imageUrl,
      });
      console.log(
        `[BROKEN/EMPTY IMAGE #${failedAsins.length}] ASIN: ${asin} (${item.productName.split("|")[0]}) | page: ${item.pageId} | status: ${res.status} | size: ${res.size}b | url: ${item.imageUrl}`
      );
    }
    if (count % 50 === 0) {
      console.log(`Progress: ${count}/${asinMap.size} unique ASINs checked... (Found ${failedAsins.length} broken)`);
    }
  }

  console.log(`\n=== AUDIT COMPLETE ===`);
  console.log(`Total unique ASINs checked: ${asinMap.size}`);
  console.log(`Valid HD product images (>5KB): ${validAsins.length}`);
  console.log(`Broken/Empty product images (<=5KB or error): ${failedAsins.length}`);

  fs.writeFileSync(
    "data/broken-images-report.json",
    JSON.stringify(failedAsins, null, 2)
  );
  console.log("Saved broken images report to data/broken-images-report.json");
}

audit();
