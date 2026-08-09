import fs from "node:fs";
import https from "node:https";

const rvAsins = [
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

function fetchHtml(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }
    );
    req.on("error", () => resolve(""));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve("");
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
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      },
      (res) => {
        const contentLength = Number.parseInt(res.headers["content-length"] || "0", 10);
        resolve({ ok: res.statusCode === 200, status: res.statusCode, size: contentLength });
      }
    );
    req.on("error", () => resolve({ ok: false, status: 500, size: 0 }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false, status: 408, size: 0 });
    });
  });
}

async function findImages() {
  console.log("Fetching real Amazon product image URLs for 14 Robot Vacuums...");
  const resultMap = {};

  for (const item of rvAsins) {
    const html = await fetchHtml(item.asin);
    // Find m.media-amazon.com/images/I/....jpg
    const matches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.(?:jpg|png)/g) || [];
    const mainImgs = matches.filter((u) => u.includes("_AC_") || u.includes("_SL1500_") || u.includes("_SX") || u.includes("_SY"));

    let validUrl = null;
    for (const url of mainImgs) {
      const res = await checkUrl(url);
      if (res.ok && res.size > 5000) {
        validUrl = url;
        console.log(`[FOUND HTML] ${item.asin} (${item.name}): ${url} (${res.size} bytes)`);
        break;
      }
    }

    if (!validUrl) {
      // Test direct image pattern
      const candidates = [
        `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
        `https://m.media-amazon.com/images/P/${item.asin}.01._SL1500_.jpg`,
      ];
      for (const url of candidates) {
        const res = await checkUrl(url);
        if (res.ok && res.size > 2000) {
          validUrl = url;
          console.log(`[FOUND DIRECT] ${item.asin} (${item.name}): ${url} (${res.size} bytes)`);
          break;
        }
      }
    }

    if (validUrl) {
      resultMap[item.asin] = validUrl;
    } else {
      console.log(`[MISSING] ${item.asin} (${item.name})`);
    }
  }

  console.log("\nFinal Robot Vacuum Image Map:\n", JSON.stringify(resultMap, null, 2));
}

findImages();
