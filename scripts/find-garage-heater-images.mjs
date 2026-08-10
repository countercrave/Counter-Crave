import https from "node:https";

const asins = {
  FUH54: ["B0000AXEZV", "B000L7J9O2", "B00002N7FJ"],
  DR988: ["B003XDTWN2", "B003XDTWO6"],
  KingKB2410: ["B00L5XN6P4", "B00L5XN6OS"],
  BigBuddy: ["B0002WRHE8", "B07Q86S5H1"],
  CZ798: ["B004VVJANC"],
  HeatStorm: ["B07JXRWJ8D"]
};

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
  for (const [key, list] of Object.entries(asins)) {
    for (const asin of list) {
      console.log(`Checking ${key} (${asin})...`);
      const html = await fetchAmazonDp(asin);
      const matches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
      for (const u of matches) {
        if (!u.includes("SY30") && !u.includes("SX38") && !u.includes("SS40")) {
          const clean = u.replace(/\._.*_\./, "._AC_SL1500_.");
          const res = await checkUrl(clean);
          if (res.ok && res.size > 15000) {
            console.log(`[SUCCESS] ${key} (${asin}): ${clean} (${res.size} bytes)`);
            break;
          }
        }
      }
    }
  }
}

run();
