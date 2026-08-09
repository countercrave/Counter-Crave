import fs from "node:fs";
import https from "node:https";

const items = [
  { asin: "B0GHY7VT3Y", name: "ECOVACS DEEBOT T80S OMNI" },
  { asin: "B0DWXBCQVP", name: "Roborock Q10 S5+" },
  { asin: "B0F3BXY5M1", name: "Dreame D20 Pro Plus" },
  { asin: "B0D9VT8NGL", name: "ECOVACS DEEBOT N20 Pro Plus" },
  { asin: "B09H8CWFNK", name: "Shark AV2501S AI Ultra" },
  { asin: "B0DWX69JVG", name: "Roborock Q7 M5+" },
  { asin: "B0DR7W6CZM", name: "eufy C10 Auto-Empty" },
  { asin: "B0DHCJ571Z", name: "Roborock Saros 10R" },
  { asin: "B0FSJPFDPV", name: "Dreame L40 Ultra Gen 2" },
  { asin: "B0DNDVRRXV", name: "Roborock Qrevo Curv S5X" },
  { asin: "B0D9ZRH61T", name: "iRobot Roomba Combo 10 Max" },
  { asin: "B0DR8NJMCJ", name: "Ecovacs Deebot X8 Pro Omni" },
  { asin: "B0D7HG8H24", name: "Narwal Freo Z Ultra" },
  { asin: "B0CPFBBHP4", name: "eufy X10 Pro Omni" },
];

function searchImages(query) {
  return new Promise((resolve) => {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " m.media-amazon.com/images/I/")}`;
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const matches = body.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.(?:jpg|png)/g) || [];
          resolve(matches);
        });
      }
    );
    req.on("error", () => resolve([]));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

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
        resolve({ ok: res.statusCode === 200, size });
      }
    );
    req.on("error", () => resolve({ ok: false, size: 0 }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false, size: 0 });
    });
  });
}

async function runSearch() {
  console.log("Searching for high-res Amazon media CDN images for 14 Robot Vacuums...");
  const resultMap = {};

  for (const item of items) {
    const matches = await searchImages(item.asin + " " + item.name);
    let found = null;
    for (const rawUrl of matches) {
      // Clean up URL format
      const cleanUrl = rawUrl.replace(/\._.*_\./, "._AC_SL1500_.");
      const res = await checkUrl(cleanUrl);
      if (res.ok && res.size > 5000) {
        found = cleanUrl;
        console.log(`[OK] ${item.asin} (${item.name}): ${cleanUrl} (${res.size} bytes)`);
        break;
      }
    }
    if (!found) {
      console.log(`[SEARCH FAILED] ${item.asin} (${item.name})`);
    } else {
      resultMap[item.asin] = found;
    }
  }

  console.log("\nFound Image Map:\n", JSON.stringify(resultMap, null, 2));
}

runSearch();
