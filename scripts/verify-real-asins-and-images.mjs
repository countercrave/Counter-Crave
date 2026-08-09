import fs from "node:fs";
import https from "node:https";

const realAsinMap = {
  // Ninja Air Fryer Pro 4-in-1 (AF161)
  B0B1M7WRQ4: "B07S5RDVTW",
  // Ninja Crispi Portable Air Fryer
  B0CV4LDK6P: "B0CS3V8M9H",
  // BELLA Pro Series 8-Qt Air Fryer
  B08XYS6D24: "B08DKYBTPH",
  // Ninja Foodi Dual-Zone Alternative
  B09N43K4B4: "B096X9LGJ1",
  // Dual Basket Air Fryer Value Pick
  B0BXQ8V8QQ: "B0B15Q3HCQ",
  // Value Family Air Fryer
  B0C5XKQZ2P: "B08BXX69K4",
  // Ultrean Air Fryer 4.2-Qt
  B09MW1R6Y6: "B07FF1171L",
  // Small Kitchen Compact Air Fryer
  B09Y7B3J1N: "B08K38L62B",
  // Starter Air Fryer Under $50 Class
  B0BSCY5V3K: "B0936FGLQS",
  // Compact Budget Air Fryer
  B08TR59W7Q: "B08323RNKC",
  // Essential Compact Air Fryer
  B07VG5Z5ZQ: "B07VDJ38M6",
  // Budget Crispy Snack Air Fryer
  B0B7KQ8M1N: "B085VQFZCH",
  // NutriBullet Pro Personal Blender
  B01FHOWYA2: "B007TIE0GQ",
  B00D2HTKQ6: "B007TIE0GQ",
  // NutriBullet Pro+ Personal Blender
  B01N1NTBJ8: "B072LX9J8L",
  // Oster Pro 1200 Blender
  B07GZW9WXH: "B00XBOQI8S",
  // Oster Blender with Food Processor Attachment
  B07GZVZJ27: "B00NL964D4",
  // Ninja Personal Blender with Cups
  B08MJ5K5L8: "B01FXMDVPE",
  // Ninja Foodi Smoothie Bowl Maker & Blender
  B098RK8BL7: "B08928L8K2",
  // NutriBullet Combo Blender
  B0B7QVJK8Y: "B07V78XQDF",
  // Hamilton Beach Personal Blender
  B004TGLB8S: "B00EI7DPI0",
  // Hamilton Beach Wave Crusher Blender
  B00M76N6TS: "B00KTYIWO0",
  // Cuisinart SmartPower Classic Blender
  B008H4SLVX: "B00004S9CT",
  // Oster Reverse Crush Counterforms Blender
  B00FFSO0FE: "B003TXV49A",
  // Oster Professional Smoothie Blender
  B01H08Y7S2: "B01AW5CL4E",
  // Ninja Nutri Personal Blender Duo
  B07YHL6ZBW: "B00NGV4E1G",
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
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
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

async function verifyRealAsins() {
  console.log("Verifying real ASINs and scraping high-res images...");
  const fixedMap = JSON.parse(
    fs.readFileSync("data/fixed-images-map.json", "utf8")
  );

  for (const [oldAsin, newAsin] of Object.entries(realAsinMap)) {
    console.log(`\nTesting ASIN mapping: ${oldAsin} -> ${newAsin}...`);
    const html = await fetchAmazonDp(newAsin);
    let foundUrl = null;

    const dynamicMatch = html.match(/data-a-dynamic-image="([^"]+)"/);
    if (dynamicMatch) {
      try {
        const decoded = dynamicMatch[1].replace(/&quot;/g, '"');
        const parsed = JSON.parse(decoded);
        const urls = Object.keys(parsed);
        for (const u of urls) {
          const clean = u.replace(/\._.*_\./, "._AC_SL1500_.");
          const res = await checkUrl(clean);
          if (res.ok && res.size > 15000) {
            foundUrl = clean;
            break;
          }
        }
      } catch (e) {}
    }

    if (!foundUrl) {
      const landingMatch =
        html.match(/"landingImage":\s*"([^"]+)"/) ||
        html.match(/"hiRes":\s*"([^"]+)"/);
      if (landingMatch) {
        const clean = landingMatch[1].replace(/\._.*_\./, "._AC_SL1500_.");
        const res = await checkUrl(clean);
        if (res.ok && res.size > 15000) {
          foundUrl = clean;
        }
      }
    }

    if (foundUrl) {
      fixedMap[oldAsin] = foundUrl;
      console.log(`  => SUCCESS HD (${oldAsin}): ${foundUrl}`);
    } else {
      console.log(`  => FAIL on ${newAsin}`);
    }
  }

  console.log(`\nTotal verified high-res images: ${Object.keys(fixedMap).length}/44`);
  fs.writeFileSync("data/fixed-images-map.json", JSON.stringify(fixedMap, null, 2));
}

verifyRealAsins();
