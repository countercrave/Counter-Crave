import fs from "node:fs";
import https from "node:https";

const asins = [
  "B0DHCJ571Z", "B0FSJPFDPV", "B0DNDVRRXV", "B0D7HG8H24", "B0CPFBBHP4",
  "B0DWXBCQVP", "B0F3BXY5M1", "B0DWX69JVG", "B0DR7W6CZM"
];

const variants = [
  "PT01", "PT02", "PT03", "PT04", "PT05", "MAIN", "SL1500", "LZZZZZZZ"
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

async function runTest() {
  console.log("Testing PT variants for remaining 9 ASINs...");
  const resultMap = {};

  for (const asin of asins) {
    let found = null;
    for (const v of variants) {
      const url = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.${v}._SL1500_.jpg`;
      const res = await checkUrl(url);
      if (res.ok && res.size > 2000) {
        found = { url, size: res.size };
        console.log(`[OK] ${asin} (${v}): ${url} (${res.size} bytes)`);
        break;
      }
    }
    if (found) {
      resultMap[asin] = found.url;
    } else {
      console.log(`[FAIL] ${asin}`);
    }
  }

  console.log("\nResults:\n", JSON.stringify(resultMap, null, 2));
}

runTest();
