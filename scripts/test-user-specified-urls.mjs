import https from "node:https";

const urls = [
  "https://m.media-amazon.com/images/I/91k0U7afkVL._AC_SL1500_.jpg", // Lasko CD08200
  "https://m.media-amazon.com/images/I/815C2NcINvL._AC_SL1500_.jpg", // DREO B09YXJMH87
  "https://m.media-amazon.com/images/I/71CsSQNfLOL._AC_SL1500_.jpg", // Dreo WH719S
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
        resolve({ url, ok: res.statusCode === 200, size });
      }
    );
    req.on("error", () => resolve({ url, ok: false, size: 0 }));
    req.setTimeout(3500, () => {
      req.destroy();
      resolve({ url, ok: false, size: 0 });
    });
  });
}

async function run() {
  for (const u of urls) {
    const r = await checkUrl(u);
    console.log(`${r.ok ? "[OK]" : "[FAIL]"} ${r.url} (${r.size} bytes)`);
  }
}

run();
