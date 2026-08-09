import fs from "node:fs";
import https from "node:https";

const asins = [
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
  { asin: "B0DR7W6CZM", name: "eufy C10 Auto-Empty" }
];

// High quality verified main product images on m.media-amazon.com
const verifiedImages = {
  "B0DHCJ571Z": "https://m.media-amazon.com/images/I/619xjRMbkSL._AC_SL1500_.jpg", // Roborock Saros 10R
  "B0FSJPFDPV": "https://m.media-amazon.com/images/I/61hMADKz9DL._AC_SL1500_.jpg", // Dreame L40 Ultra Gen 2
  "B0DNDVRRXV": "https://m.media-amazon.com/images/I/61jC5z8W0yL._AC_SL1500_.jpg", // Roborock Qrevo Curv S5X
  "B0D9ZRH61T": "https://m.media-amazon.com/images/I/71R2nJ4YQvL._AC_SL1500_.jpg", // iRobot Roomba Combo 10 Max MAIN
  "B0DR8NJMCJ": "https://m.media-amazon.com/images/I/61qM8D3zOLL._AC_SL1500_.jpg", // Ecovacs Deebot X8 Pro Omni
  "B0D7HG8H24": "https://m.media-amazon.com/images/I/61y8B2zM-TL._AC_SL1500_.jpg", // Narwal Freo Z Ultra
  "B09H8CWFNK": "https://m.media-amazon.com/images/I/71K+B84J00L._AC_SL1500_.jpg", // Shark AI Ultra
  "B0CPFBBHP4": "https://m.media-amazon.com/images/I/61W2W0d4H6L._AC_SL1500_.jpg", // eufy X10 Pro Omni
  "B0GHY7VT3Y": "https://m.media-amazon.com/images/I/719h0Xg4rKL._AC_SL1500_.jpg", // ECOVACS DEEBOT T80S OMNI
  "B0DWXBCQVP": "https://m.media-amazon.com/images/I/61PZ6e0Y8JL._AC_SL1500_.jpg", // Roborock Q10 S5+
  "B0F3BXY5M1": "https://m.media-amazon.com/images/I/61e8-X8v7YL._AC_SL1500_.jpg", // Dreame D20 Pro Plus
  "B0D9VT8NGL": "https://m.media-amazon.com/images/I/71Rk458m3GL._AC_SL1500_.jpg", // ECOVACS DEEBOT N20 Pro Plus
  "B0DWX69JVG": "https://m.media-amazon.com/images/I/61C2-8G1JtL._AC_SL1500_.jpg", // Roborock Q7 M5+
  "B0DR7W6CZM": "https://m.media-amazon.com/images/I/61q-8hW7z5L._AC_SL1500_.jpg"  // eufy C10 Auto-Empty
};

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
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ ok: false, size: 0, url });
    });
  });
}

async function verifyAll() {
  console.log("Verifying 14 Robot Vacuum HD main product images...");
  for (const item of asins) {
    const url = verifiedImages[item.asin];
    const res = await checkUrl(url);
    console.log(`${item.asin} (${item.name}): ${res.ok && res.size > 10000 ? "OK HD (" + res.size + " bytes)" : "FAIL (" + res.size + " bytes)"} -> ${url}`);
  }
}

verifyAll();
