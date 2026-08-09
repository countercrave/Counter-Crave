import fs from "node:fs";
import https from "node:https";

const brokenList = JSON.parse(
  fs.readFileSync("data/broken-images-report.json", "utf8")
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
        const size = Number.parseInt(res.headers["content-length"] || "0", 10);
        resolve({ ok: res.statusCode === 200, size });
      }
    );
    req.on("error", () => resolve({ ok: false, size: 0 }));
    req.setTimeout(3500, () => {
      req.destroy();
      resolve({ ok: false, size: 0 });
    });
  });
}

function fetchAmazonDp(asin) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.com/dp/${asin}`;
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      },
      (res) => {
        let html = "";
        res.on("data", (chunk) => (html += chunk));
        res.on("end", () => resolve(html));
      }
    );
    req.on("error", () => resolve(""));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve("");
    });
  });
}

async function fixAll() {
  console.log(`Attempting to scrape real high-res Amazon landing images for ${brokenList.length} broken ASINs...`);
  const fixedMap = {};

  for (let i = 0; i < brokenList.length; i++) {
    const item = brokenList[i];
    const asin = item.asin;
    console.log(`\n[${i + 1}/${brokenList.length}] Scraping ASIN: ${asin} (${item.name.split("|")[0]})...`);

    const html = await fetchAmazonDp(asin);
    let foundUrl = null;

    const dynamicMatch = html.match(/data-a-dynamic-image="([^"]+)"/);
    if (dynamicMatch) {
      try {
        const decoded = dynamicMatch[1].replace(/&quot;/g, '"');
        const parsed = JSON.parse(decoded);
        const urls = Object.keys(parsed);
        for (const u of urls) {
          const clean = u.replace(/\._.*_\./, "._AC_SL1500_.");
          const res = await checkUrl(clean);
          if (res.ok && res.size > 15000) {
            foundUrl = clean;
            break;
          }
        }
      } catch (e) {}
    }

    if (!foundUrl) {
      const landingMatch =
        html.match(/"landingImage":\s*"([^"]+)"/) ||
        html.match(/"hiRes":\s*"([^"]+)"/);
      if (landingMatch) {
        const clean = landingMatch[1].replace(/\._.*_\./, "._AC_SL1500_.");
        const res = await checkUrl(clean);
        if (res.ok && res.size > 15000) {
          foundUrl = clean;
        }
      }
    }

    if (!foundUrl) {
      const matches =
        html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
      for (const u of matches) {
        if (!u.includes("SY30") && !u.includes("SX38") && !u.includes("SS40")) {
          const clean = u.replace(/\._.*_\./, "._AC_SL1500_.");
          const res = await checkUrl(clean);
          if (res.ok && res.size > 15000) {
            foundUrl = clean;
            break;
          }
        }
      }
    }

    if (foundUrl) {
      fixedMap[asin] = foundUrl;
      console.log(`  => SUCCESS: ${foundUrl}`);
    } else {
      console.log(`  => FAILED to extract from Amazon page.`);
    }
  }

  console.log(`\nExtracted ${Object.keys(fixedMap).length}/${brokenList.length} HD image URLs.`);
  fs.writeFileSync("data/fixed-images-map.json", JSON.stringify(fixedMap, null, 2));
}

fixAll();
