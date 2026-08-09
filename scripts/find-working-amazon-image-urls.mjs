import fs from "node:fs";
import https from "node:https";

const missingAsins = [
  "B0DHCJ571Z", "B0FSJPFDPV", "B0DNDVRRXV", "B0D7HG8H24", "B0CPFBBHP4",
  "B0GHY7VT3Y", "B0DWXBCQVP", "B0F3BXY5M1", "B0DWX69JVG", "B0DR7W6CZM"
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
        const contentLength = Number.parseInt(res.headers["content-length"] || "0", 10);
        resolve({ ok: res.statusCode === 200, status: res.statusCode, size: contentLength, url });
      }
    );
    req.on("error", () => resolve({ ok: false, status: 500, size: 0, url }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ ok: false, status: 408, size: 0, url });
    });
  });
}

async function testPatterns() {
  console.log("Testing Amazon image URL patterns for 10 missing ASINs...");
  const resultMap = {};

  for (const asin of missingAsins) {
    const patterns = [
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.MAIN._SL1500_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX450_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SY450_.jpg`,
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.PT01._SL1500_.jpg`,
      `https://m.media-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
      `https://m.media-amazon.com/images/P/${asin}.01.MAIN._SL1500_.jpg`,
    ];

    let found = null;
    for (const url of patterns) {
      const res = await checkUrl(url);
      if (res.ok && res.size > 2000) {
        found = { url, size: res.size };
        console.log(`[OK] ${asin}: ${url} (${res.size} bytes)`);
        break;
      }
    }

    if (!found) {
      console.log(`[ALL PATTERNS FAILED] ${asin}`);
    } else {
      resultMap[asin] = found.url;
    }
  }

  console.log("\nResults:\n", JSON.stringify(resultMap, null, 2));
}

testPatterns();
