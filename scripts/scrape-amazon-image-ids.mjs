import fs from "node:fs";
import https from "node:https";

const items = [
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

function getGoogleImageIds(query) {
  return new Promise((resolve) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query + " site:amazon.com")}&tbm=isch`;
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
          const matches = body.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[A-Za-z0-9_\-]+/g) || [];
          const amazonMatches = body.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.(?:jpg|png)/g) || [];
          resolve({ gstatic: matches, amazon: amazonMatches });
        });
      }
    );
    req.on("error", () => resolve({ gstatic: [], amazon: [] }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ gstatic: [], amazon: [] });
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

async function findIds() {
  console.log("Searching for real main Amazon product images...");
  for (const item of items) {
    const res = await getGoogleImageIds(item.asin + " " + item.name);
    console.log(`\n=== ${item.asin} (${item.name}) ===`);
    console.log("Amazon direct matches:", res.amazon);
    for (const url of res.amazon) {
      const clean = url.replace(/\._.*_\./, "._AC_SL1500_.");
      const verified = await checkUrl(clean);
      if (verified.ok && verified.size > 10000) {
        console.log(`[VERIFIED HD] ${item.asin}: ${clean} (${verified.size} bytes)`);
      }
    }
  }
}

findIds();
