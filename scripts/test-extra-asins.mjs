import https from "node:https";

const queryAsins = {
  Stiebel: ["B07H58QSLH", "B01D6E5C9A", "B000TKAHW6", "B0892BGFX5"],
  Broan: ["B0002YTL4K", "B00004WKIC", "B001E6G4L0"],
  DeLonghi: ["B003MTR8B6", "B003V1W43U", "B00006399S", "B01L1C7DSE"]
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

async function run() {
  for (const [key, list] of Object.entries(queryAsins)) {
    for (const asin of list) {
      const url = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`;
      const res = await checkUrl(url);
      console.log(`${key} (${asin}): ${res.ok ? "HTTP 200" : "FAIL"} (${res.size} bytes)`);
    }
  }
}

run();
