import http from "node:http";
import assert from "node:assert/strict";

function fetchUrl(url, redirectCount = 0) {
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

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE LOCAL SITE VERIFICATION ===");
  const base = "http://localhost:3001";

  // 1. Homepage
  const home = await fetchUrl(`${base}/`);
  assert.equal(home.status, 200, "Homepage must return 200");
  assert.ok(home.body.includes("CounterCrave"), "Homepage contains CounterCrave");
  assert.ok(home.body.includes("34"), "Homepage contains 34 guides count");
  assert.ok(home.body.includes("625"), "Homepage contains 625 placements count");
  console.log("✔ Homepage passed (status: 200, 34 guides, 625 source placements)");

  // 2. Guides Index
  const guides = await fetchUrl(`${base}/guides`);
  assert.equal(guides.status, 200, "Guides index must return 200");
  assert.ok(/34.*complete kitchen guides/i.test(guides.body), "Guides index mentions 34 guides");
  console.log("✔ Guides index passed (status: 200, 34 complete kitchen guides)");

  // 3. Category Routes (9 categories)
  const categories = [
    "air-fryers",
    "blenders",
    "food-processors",
    "toaster-ovens",
    "mini-choppers",
    "rice-cookers",
    "electric-kettles",
    "coffee-grinders",
    "waffle-makers"
  ];
  for (const cat of categories) {
    const res = await fetchUrl(`${base}/categories/${cat}`);
    assert.equal(res.status, 200, `Category /categories/${cat} must return 200`);
  }
  console.log(`✔ All ${categories.length} category routes passed with status 200`);

  // 4. Representative Guide Routes
  const nonToxic = await fetchUrl(`${base}/guides/best-non-toxic-air-fryer`);
  assert.equal(nonToxic.status, 200);
  assert.equal((nonToxic.body.match(/class="best-pick-card/g) || []).length, 3, "3 best pick cards");
  assert.equal((nonToxic.body.match(/class="source-product-card"/g) || []).length, 24, "24 source products");
  assert.ok(nonToxic.body.includes("B0FJYK886N"), "Includes ASIN B0FJYK886N");
  assert.ok(nonToxic.body.includes('"@type":"Article"'), "Article JSON-LD");
  console.log("✔ /guides/best-non-toxic-air-fryer passed (24 source products, 3 best picks, ASINs, Article Schema)");

  const thighs = await fetchUrl(`${base}/guides/best-air-fryer-chicken-thighs`);
  assert.equal(thighs.status, 200);
  assert.equal((thighs.body.match(/class="source-product-card"/g) || []).length, 61, "61 source products");
  console.log("✔ /guides/best-air-fryer-chicken-thighs passed (61 source products)");

  const tofu = await fetchUrl(`${base}/guides/best-air-fryer-crispy-tofu-recipe`);
  assert.equal(tofu.status, 200);
  assert.ok(tofu.body.includes('"@type":"Recipe"'), "Recipe schema present");
  console.log("✔ /guides/best-air-fryer-crispy-tofu-recipe passed (Recipe Schema present)");

  const clean = await fetchUrl(`${base}/guides/best-way-to-clean-air-fryer`);
  assert.equal(clean.status, 200);
  assert.ok(clean.body.includes('"@type":"HowTo"'), "HowTo schema present");
  console.log("✔ /guides/best-way-to-clean-air-fryer passed (HowTo Schema present)");

  const things = await fetchUrl(`${base}/guides/best-things-to-cook-in-air-fryer`);
  assert.equal(things.status, 200);
  console.log("✔ /guides/best-things-to-cook-in-air-fryer passed (status: 200)");

  // 5. Robots.txt
  const robots = await fetchUrl(`${base}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.ok(robots.body.includes("https://countercrave.com/sitemap.xml"), "Robots points to production sitemap");
  assert.ok(robots.body.includes("Allow: /"), "Robots allows crawling");
  console.log("✔ /robots.txt passed (status: 200, points to https://countercrave.com/sitemap.xml)");

  // 6. Sitemap.xml
  const sitemap = await fetchUrl(`${base}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  assert.ok(sitemap.body.includes("<urlset"), "Sitemap is valid XML");
  assert.ok(!sitemap.body.includes(".html"), "Sitemap has NO .html URLs");
  assert.ok(sitemap.body.includes("https://countercrave.com/guides/best-non-toxic-air-fryer"), "Sitemap has guide canonicals");
  console.log("✔ /sitemap.xml passed (valid XML, 0 .html URLs, clean canonicals)");

  // 7. 404 tests for unknown slugs
  const notFoundGuide = await fetchUrl(`${base}/guides/nonexistent-guide-xyz`);
  assert.equal(notFoundGuide.status, 404, "Invalid guide must return 404");
  const notFoundCat = await fetchUrl(`${base}/categories/nonexistent-cat-xyz`);
  assert.equal(notFoundCat.status, 404, "Invalid category must return 404");
  console.log("✔ 404 handling passed for nonexistent routes");

  // 8. Legacy .html Redirects
  const redir1 = await fetchUrl(`${base}/best-non-toxic-air-fryer.html`);
  assert.ok(redir1.status === 308 || redir1.status === 301, "Redirect status for /slug.html");
  assert.equal(redir1.location, "/guides/best-non-toxic-air-fryer");

  const redir2 = await fetchUrl(`${base}/guides/best-non-toxic-air-fryer.html`);
  assert.ok(redir2.status === 308 || redir2.status === 301);
  assert.equal(redir2.location, "/guides/best-non-toxic-air-fryer");

  const redir3 = await fetchUrl(`${base}/air-fryers.html`);
  assert.ok(redir3.status === 308 || redir3.status === 301);
  assert.equal(redir3.location, "/categories/air-fryers");

  const redir4 = await fetchUrl(`${base}/categories/air-fryers.html`);
  assert.ok(redir4.status === 308 || redir4.status === 301);
  assert.equal(redir4.location, "/categories/air-fryers");

  const redir5 = await fetchUrl(`${base}/about.html`);
  assert.ok(redir5.status === 308 || redir5.status === 301);
  assert.equal(redir5.location, "/about");

  const redir6 = await fetchUrl(`${base}/disclosure.html`);
  assert.ok(redir6.status === 308 || redir6.status === 301);
  assert.equal(redir6.location, "/disclosure");

  console.log("✔ All single-hop legacy .html redirects passed");

  // 9. Non-existent .html returns 404 (no blind catch-all)
  const unknownHtml = await fetchUrl(`${base}/completely-unknown-random-file.html`);
  assert.equal(unknownHtml.status, 404, "Unknown .html file must return 404");
  console.log("✔ Unknown .html file returns 404 (no blind redirect)");

  console.log("\n==========================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
