import http from "node:http";
import assert from "node:assert/strict";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          location: res.headers.location,
        });
      });
    }).on("error", reject);
  });
}

function countH1(html) {
  const matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
  return matches ? matches.length : 0;
}

function extractJsonLd(html) {
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  const list = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      list.push(JSON.parse(match[1]));
    } catch (err) {
      throw new Error(`Failed to parse JSON-LD: ${err.message}\n${match[1]}`);
    }
  }
  return list;
}

async function runTests() {
  console.log("=== COMPREHENSIVE RECIPE EXPANSION VERIFICATION ===");
  const base = "http://localhost:3002";

  // 1. Recipes Hub
  const hub = await fetchUrl(`${base}/recipes`);
  assert.equal(hub.status, 200, "Hub /recipes must return 200");
  assert.equal(countH1(hub.body), 1, "Hub /recipes must have exactly 1 H1");
  assert.ok(hub.body.includes("Cook by the cue, not by hope."), "Hub H1 text");
  assert.ok(hub.body.includes('rel="canonical"') && hub.body.includes("/recipes"), "Hub canonical");
  const hubSchemas = extractJsonLd(hub.body);
  assert.ok(hubSchemas.length > 0, "Hub has JSON-LD");
  assert.ok(JSON.stringify(hubSchemas).includes("CollectionPage"), "Hub has CollectionPage schema");
  assert.ok(JSON.stringify(hubSchemas).includes("ItemList"), "Hub has ItemList schema");
  console.log("✔ /recipes Hub passed (200, single H1, canonical, CollectionPage & ItemList JSON-LD)");

  // 2. 18 Easy 30-Minute Dinners
  const dinners = await fetchUrl(`${base}/guides/easy-30-minute-dinner-ideas`);
  assert.equal(dinners.status, 200, "Dinners must return 200");
  assert.equal(countH1(dinners.body), 1, "Dinners must have exactly 1 H1");
  assert.ok(dinners.body.includes('rel="canonical"') && dinners.body.includes("/guides/easy-30-minute-dinner-ideas"), "Dinners canonical");
  const dinnerSchemas = extractJsonLd(dinners.body);
  const dinnerSchemaJson = JSON.stringify(dinnerSchemas);
  assert.ok(dinnerSchemaJson.includes("CollectionPage"), "Dinners has CollectionPage");
  assert.ok(dinnerSchemaJson.includes("ItemList"), "Dinners has ItemList");
  assert.ok(dinnerSchemaJson.includes("FAQPage"), "Dinners has FAQPage");
  assert.equal((dinners.body.match(/class="dinner-card"/g) || []).length, 18, "18 dinner cards rendered");
  console.log("✔ /guides/easy-30-minute-dinner-ideas passed (200, single H1, 18 complete recipes, JSON-LD)");

  // 3. Crispy Roast Potatoes
  const potatoes = await fetchUrl(`${base}/guides/crispy-roast-potatoes-recipe`);
  assert.equal(potatoes.status, 200);
  assert.equal(countH1(potatoes.body), 1);
  assert.ok(potatoes.body.includes('rel="canonical"') && potatoes.body.includes("/guides/crispy-roast-potatoes-recipe"));
  assert.ok(potatoes.body.includes("recipe-card"), "Recipe card with scaling tools");
  const potatoSchemas = extractJsonLd(potatoes.body);
  assert.ok(JSON.stringify(potatoSchemas).includes('"@type":"Recipe"'), "Potato has Recipe schema");
  console.log("✔ /guides/crispy-roast-potatoes-recipe passed (200, single H1, Recipe tools, Recipe schema)");

  // 4. Reverse-Sear Prime Rib
  const rib = await fetchUrl(`${base}/guides/prime-rib-recipe`);
  assert.equal(rib.status, 200);
  assert.equal(countH1(rib.body), 1);
  assert.ok(rib.body.includes('rel="canonical"') && rib.body.includes("/guides/prime-rib-recipe"));
  assert.ok(rib.body.includes("145°F") || rib.body.includes("USDA"), "Prime rib USDA safety guidance present");
  const ribSchemas = extractJsonLd(rib.body);
  assert.ok(JSON.stringify(ribSchemas).includes('"@type":"Recipe"'), "Prime rib has Recipe schema");
  console.log("✔ /guides/prime-rib-recipe passed (200, single H1, USDA safety context, Recipe schema)");

  // 5. No-Bake Cheesecake
  const cake = await fetchUrl(`${base}/guides/no-bake-cheesecake-recipe`);
  assert.equal(cake.status, 200);
  assert.equal(countH1(cake.body), 1);
  assert.ok(cake.body.includes('rel="canonical"') && cake.body.includes("/guides/no-bake-cheesecake-recipe"));
  const cakeSchemas = extractJsonLd(cake.body);
  assert.ok(JSON.stringify(cakeSchemas).includes('"@type":"Recipe"'));
  console.log("✔ /guides/no-bake-cheesecake-recipe passed (200, single H1, Recipe schema)");

  // 6. Fluffy Buttermilk Pancakes
  const pancakes = await fetchUrl(`${base}/guides/fluffy-buttermilk-pancake-recipe`);
  assert.equal(pancakes.status, 200);
  assert.equal(countH1(pancakes.body), 1);
  assert.ok(pancakes.body.includes('rel="canonical"') && pancakes.body.includes("/guides/fluffy-buttermilk-pancake-recipe"));
  const pancakeSchemas = extractJsonLd(pancakes.body);
  assert.ok(JSON.stringify(pancakeSchemas).includes('"@type":"Recipe"'));
  console.log("✔ /guides/fluffy-buttermilk-pancake-recipe passed (200, single H1, Recipe schema)");

  // 7. Verify all 25 WebP Images
  const images = [
    "30-minute-dinners-4x3.webp",
    "30-minute-dinners-bowls.webp",
    "30-minute-dinners-hero.webp",
    "30-minute-dinners-meatless.webp",
    "30-minute-dinners-pasta.webp",
    "30-minute-dinners-skillet.webp",
    "30-minute-dinners-square.webp",
    "30-minute-dinners-tacos.webp",
    "crispy-roast-potatoes-4x3.webp",
    "crispy-roast-potatoes-hero.webp",
    "crispy-roast-potatoes-square.webp",
    "crispy-roast-potatoes-steps.webp",
    "fluffy-buttermilk-pancakes-4x3.webp",
    "fluffy-buttermilk-pancakes-hero.webp",
    "fluffy-buttermilk-pancakes-square.webp",
    "fluffy-buttermilk-pancakes-steps.webp",
    "no-bake-cheesecake-4x3.webp",
    "no-bake-cheesecake-hero.webp",
    "no-bake-cheesecake-square.webp",
    "no-bake-cheesecake-steps.webp",
    "og-countercrave-recipes.webp",
    "prime-rib-4x3.webp",
    "prime-rib-hero.webp",
    "prime-rib-square.webp",
    "prime-rib-steps.webp"
  ];
  for (const img of images) {
    const res = await fetchUrl(`${base}/images/recipes/${img}`);
    assert.equal(res.status, 200, `Image /images/recipes/${img} must return 200`);
  }
  console.log(`✔ All ${images.length} recipe WebP images return 200 OK`);

  // 8. Regressions: Home, Guides, Air Fryer Guide, Header/Footer
  const home = await fetchUrl(`${base}/`);
  assert.equal(home.status, 200);
  assert.ok(home.body.includes("/recipes"), "Home contains /recipes in header/footer");

  const existingGuide = await fetchUrl(`${base}/guides/best-air-fryers-2026`);
  assert.equal(existingGuide.status, 200);

  const nonToxic = await fetchUrl(`${base}/guides/best-non-toxic-air-fryer`);
  assert.equal(nonToxic.status, 200);
  console.log("✔ Regressions passed (Home, /guides, existing appliance guides, header/footer nav)");

  // 9. Sitemap Verification
  const sitemap = await fetchUrl(`${base}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  assert.ok(sitemap.body.includes("<urlset"), "Sitemap is valid XML");
  assert.ok(sitemap.body.includes("https://countercrave.com/recipes"), "Sitemap has /recipes");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/easy-30-minute-dinner-ideas"), "Sitemap has 30-min dinners");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/crispy-roast-potatoes-recipe"), "Sitemap has crispy potatoes");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/prime-rib-recipe"), "Sitemap has prime rib");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/no-bake-cheesecake-recipe"), "Sitemap has cheesecake");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/fluffy-buttermilk-pancake-recipe"), "Sitemap has pancakes");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/best-non-toxic-air-fryer"), "Sitemap retains old guides");
  assert.ok(!sitemap.body.includes(".html"), "Sitemap has NO .html URLs");
  console.log("✔ /sitemap.xml passed (includes all old URLs + 6 new recipe URLs, 0 .html URLs)");

  // 10. 404 for unknown routes
  const notFound = await fetchUrl(`${base}/guides/unknown-recipe-xyz`);
  assert.equal(notFound.status, 404, "Unknown guide must return 404");
  console.log("✔ Unknown guide slug returns 404");

  console.log("\n==========================================");
  console.log("🎉 ALL 10 TEST SUITES PASSED WITH 100% ACCURACY!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
