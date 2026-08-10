import https from "node:https";

const asins = {
  WH719S: ["B0CBBR4TLX"],
  CD08200: ["B01NAQO4F1"],
  CD08210: ["B0777MQG49", "B000BWE45O", "B01NAQO4F1"],
  GiveBest: ["B0GB6NRC9W", "B0CGHVBVFY", "B0C9DGRJ97"],
  Stiebel: ["B000TKAHW6", "B07H58QSLH", "B0002YTL4K"],
  Broan: ["B000NPTC2U", "B0002YTL4K"],
  DeLonghi: ["B003MTR8B6", "B003V1W43U"],
  B09YXJMH87: ["B09YXJMH87"],
  B0CHJ9PPPP: ["B0CHJ9PPPP"],
  B0FMY78CVB: ["B0FMY78CVB"],
  B0FGJJJMD5: ["B0FGJJJMD5"],
  B0DCC5QWQ1: ["B0DCC5QWQ1"],
  B0GB6NRC9W: ["B0GB6NRC9W"],
  B0D819MVKF: ["B0D819MVKF"],
  B0CGHVBVFY: ["B0CGHVBVFY"],
  B0DBZMNY2X: ["B0DBZMNY2X"],
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
  const results = {};
  for (const [key, list] of Object.entries(asins)) {
    for (const asin of list) {
      console.log(`Checking ${key} (${asin})...`);
      const html = await fetchAmazonDp(asin);
      const matches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
      let found = false;
      for (const u of matches) {
        if (!u.includes("SY30") && !u.includes("SX38") && !u.includes("SS40")) {
          const clean = u.replace(/\._.*_\./, "._AC_SL1500_.");
          const res = await checkUrl(clean);
          if (res.ok && res.size > 15000) {
            console.log(`[SUCCESS] ${key} (${asin}): ${clean} (${res.size} bytes)`);
            results[key] = { asin, imageUrl: clean };
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
  }
  console.log("\n=== FINAL RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
}

run();
