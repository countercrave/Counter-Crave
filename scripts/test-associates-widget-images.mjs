import fs from "node:fs";
import https from "node:https";

const brokenList = JSON.parse(
  fs.readFileSync("data/broken-images-report.json", "utf8")
);
const fixedMap = JSON.parse(
  fs.readFileSync("data/fixed-images-map.json", "utf8")
);

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) return resolve({ ok: false, size: 0 });
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        // Follow redirect if 301/302
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          return resolve(checkUrl(loc));
        }
        const size = Number.parseInt(res.headers["content-length"] || "0", 10);
        resolve({ ok: res.statusCode === 200, size, finalUrl: url });
      }
    );
    req.on("error", () => resolve({ ok: false, size: 0 }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ ok: false, size: 0 });
    });
  });
}

async function testWidgets() {
  console.log("Testing Amazon Associates Official Widget Image URLs for remaining ASINs...");
  const combinedMap = { ...fixedMap };

  for (const item of brokenList) {
    if (!combinedMap[item.asin]) {
      const widgetUrl = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${item.asin}&Format=_SL500_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
      const res = await checkUrl(widgetUrl);
      if (res.ok && res.size > 5000) {
        combinedMap[item.asin] = widgetUrl;
        console.log(`[WIDGET SUCCESS] ${item.asin} (${item.name.split("|")[0]}): ${res.size} bytes -> ${widgetUrl}`);
      } else {
        // Try SL1500 PT01 variant
        const pt01Url = `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01.PT01._SL1500_.jpg`;
        const resPt = await checkUrl(pt01Url);
        if (resPt.ok && resPt.size > 5000) {
          combinedMap[item.asin] = pt01Url;
          console.log(`[PT01 SUCCESS] ${item.asin} (${item.name.split("|")[0]}): ${resPt.size} bytes -> ${pt01Url}`);
        } else {
          console.log(`[REMAINING FAIL] ${item.asin} (${item.name.split("|")[0]})`);
        }
      }
    }
  }

  console.log(`Total resolved images: ${Object.keys(combinedMap).length}/${brokenList.length}`);
  fs.writeFileSync("data/fixed-images-map.json", JSON.stringify(combinedMap, null, 2));
}

testWidgets();
