/**
 * Fill missing brand logos (retry alts, else SVG badge).
 * Usage: node scripts/fetch-brand-logos.mjs
 */
import fs from "node:fs";
import https from "node:https";
import http from "node:http";

const mapPath = "data/air-fryer-brand-logos.local.json";
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));

function slug(brand) {
  return String(brand)
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuf(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(String(res.statusCode)));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            buf: Buffer.concat(chunks),
            type: res.headers["content-type"] || "",
          }),
        );
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
  });
}

function writeBadge(brand) {
  const initials = brand
    .replace(/[^A-Za-z0-9+]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#0f4c46"/><text x="64" y="74" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="36" font-weight="700" fill="#fff">${initials}</text></svg>`;
  const file = `public/images/brands/${slug(brand)}.svg`;
  fs.writeFileSync(file, svg);
  map[brand] = `/images/brands/${slug(brand)}.svg`;
  console.log("badge", brand, initials);
}

const alts = {
  "Instant Pot": [
    "https://instantpot.com/cdn/shop/files/instant-pot-logo.png",
    "https://www.instantpot.com/favicon.ico",
  ],
  Chefman: [
    "https://www.chefman.com/favicon.ico",
    "https://chefman.com/cdn/shop/files/chefman-logo.png",
  ],
  Gourmia: [
    "https://www.gourmia.com/favicon.ico",
    "https://shop.gourmia.com/cdn/shop/files/gourmia.png",
  ],
  Typhur: [
    "https://www.typhur.com/cdn/shop/files/typhur_logo.png",
    "https://typhur.com/favicon.ico",
  ],
  NuWave: [
    "https://www.nuwavenow.com/cdn/shop/files/nuwave-logo.png",
    "https://nuwavenow.com/favicon.ico",
  ],
  "BLACK+DECKER": [
    "https://www.blackanddecker.com/favicon.ico",
    "https://www.bdappliances.com/favicon.ico",
  ],
  Midea: [
    "https://us.midea.com/favicon.ico",
    "https://www.midea.com/favicon.ico",
  ],
  Kalorik: [
    "https://kalorik.com/favicon.ico",
    "https://www.kalorik.com/cdn/shop/files/kalorik.png",
  ],
};

for (const [brand, urls] of Object.entries(alts)) {
  if (map[brand]) continue;
  let ok = false;
  for (const u of urls) {
    try {
      const { buf, type } = await fetchBuf(u);
      if (buf.length < 50) continue;
      let ext = ".png";
      if (/svg/i.test(type) || /\.svg/i.test(u)) ext = ".svg";
      else if (/ico/i.test(type) || /\.ico/i.test(u)) ext = ".ico";
      else if (/jpe?g/i.test(type)) ext = ".jpg";
      const file = `public/images/brands/${slug(brand)}${ext}`;
      fs.writeFileSync(file, buf);
      map[brand] = `/images/brands/${slug(brand)}${ext}`;
      console.log("ok", brand, file, buf.length);
      ok = true;
      break;
    } catch (e) {
      console.log("try fail", brand, e.message);
    }
  }
  if (!ok) writeBadge(brand);
}

// ensure every brand in source has an entry
const src = JSON.parse(fs.readFileSync("data/air-fryer-brands.source.json", "utf8"));
for (const row of src.brands) {
  if (!map[row.Brand]) writeBadge(row.Brand);
}

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log("done", map);
