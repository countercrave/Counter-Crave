import fs from "node:fs";
import https from "node:https";

const items = [
  { asin: "B0DHCJ571Z", name: "Roborock Saros 10R" },
  { asin: "B0FSJPFDPV", name: "Dreame L40 Ultra Gen 2" },
  { asin: "B0DNDVRRXV", name: "Roborock Qrevo Curv S5X" },
  { asin: "B0D9ZRH61T", name: "iRobot Roomba Combo 10 Max" },
  { asin: "B0DR8NJMCJ", name: "Ecovacs Deebot X8 Pro Omni" },
  { asin: "B0D7HG8H24", name: "Narwal Freo Z Ultra" },
  { asin: "B09H8CWFNK", name: "Shark AI Ultra" },
  { asin: "B0CPFBBHP4", name: "eufy X10 Pro Omni" },
  { asin: "B0GHY7VT3Y", name: "ECOVACS DEEBOT T80S OMNI" },
  { asin: "B0DWXBCQVP", name: "Roborock Q10 S5+" },
  { asin: "B0F3BXY5M1", name: "Dreame D20 Pro Plus" },
  { asin: "B0D9VT8NGL", name: "ECOVACS DEEBOT N20 Pro Plus" },
  { asin: "B0DWX69JVG", name: "Roborock Q7 M5+" },
  { asin: "B0DR7W6CZM", name: "eufy C10 Auto-Empty" },
];

function checkUrl(url) {
  return new Promise((resolve) => {
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
        resolve({ ok: res.statusCode === 200, size, url });
      }
    );
    req.on("error", () => resolve({ ok: false, size: 0, url }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ok: false, size: 0, url });
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
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

async function run() {
  console.log("Scraping real main high-res product images from Amazon...");
  const resultMap = {};

  for (const item of items) {
    const html = await fetchAmazonDp(item.asin);
    // Find landingImage or hiRes or dynamicImage JSON
    const landingMatch = html.match(/"landingImage":\s*"([^"]+)"/) || html.match(/"hiRes":\s*"([^"]+)"/);
    const dynamicMatch = html.match(/data-a-dynamic-image="([^"]+)"/);

    let foundUrl = null;

    if (dynamicMatch) {
      try {
        const decoded = dynamicMatch[1].replace(/&quot;/g, '"');
        const parsed = JSON.parse(decoded);
        const urls = Object.keys(parsed);
        // Find largest image
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

    if (!foundUrl && landingMatch) {
      const clean = landingMatch[1].replace(/\._.*_\./, "._AC_SL1500_.");
      const res = await checkUrl(clean);
      if (res.ok && res.size > 15000) {
        foundUrl = clean;
      }
    }

    if (!foundUrl) {
      // Try any m.media-amazon.com image found in HTML
      const matches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
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
      resultMap[item.asin] = foundUrl;
      console.log(`[SUCCESS] ${item.asin} (${item.name}): ${foundUrl}`);
    } else {
      console.log(`[FAILED TO SCRAPE] ${item.asin} (${item.name})`);
    }
  }

  console.log("\nFinal Real Main HD Image Map:\n", JSON.stringify(resultMap, null, 2));
}

run();
