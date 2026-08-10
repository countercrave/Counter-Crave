import https from "node:https";

const asins = {
  DR968: ["B002QZ11J6"],
  DR998: ["B0775PZDXM", "B004I1CN52"],
  Phoenix: ["B07JXRWJ8D", "B0771LZZT3", "B07GZ39SL7"],
  Duraflame: ["B0797H73VT", "B07GZW2T3S", "B00F5EJ47K"],
  AmazonBasics: ["B07JW4C7BJ"],
  DR238: ["B077JM5PB9", "B0CWB4424Z", "B0BPVDH521"],
  B0CW6LC15Z: ["B0CW6LC15Z"],
  B0FNBGFH7N: ["B0FNBGFH7N"],
  B0BWGS8N5T: ["B0BWGS8N5T"],
  B07XW1YWWH: ["B07XW1YWWH"],
  B08R6R6WFZ: ["B08R6R6WFZ"],
  B0BFRS7BZ8: ["B0BFRS7BZ8"],
  B0FQ9HBZ4R: ["B0FQ9HBZ4R"],
  B07JXRTR1J: ["B07JXRTR1J"],
  B0CZ18YW7N: ["B0CZ18YW7N"],
  B0142T7250: ["B0142T7250"],
  B07719X5XC: ["B07719X5XC"],
  B00G3LD2BY: ["B00G3LD2BY"]
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
