import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../app/data/product-catalog.json", import.meta.url), "utf8"));
const picks = JSON.parse(readFileSync(new URL("../scripts/guide-picks.json", import.meta.url), "utf8"));

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const count = (html, pattern) => (html.match(pattern) ?? []).length;
const nonAmazonImages = (html) =>
  [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter((src) => !src.startsWith("https://m.media-amazon.com/"));

test("renders CounterCrave production metadata", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /<title>CounterCrave Kitchen Guides<\/title>/i);
  assert.match(html, /countercrave-og\.png/i);
  assert.match(html, /fonts\.googleapis\.com/i);
  assert.doesNotMatch(html, /name=["']codex-preview["']/i);
  assert.deepEqual(nonAmazonImages(html), []);
});

test("renders the guide index with all seven categories and the new guides", async () => {
  const response = await render("/guides");
  const html = await response.text();

  assert.equal(response.status, 200);
  for (const label of ["Air fryers", "Blenders", "Coffee", "Rice cookers", "Vacuum sealers", "Wine coolers", "Pizza ovens"]) {
    assert.match(html, new RegExp(label, "i"));
  }
  assert.match(html, /Best Pizza Oven for Home/i);
  assert.match(html, /Best Built-In Wine and Beverage Fridge/i);
  assert.match(html, /Best Wine Cooler for the Kitchen/i);
  assert.match(html, /Best Air Fryer Crispy Tofu Recipe/i);
  assert.equal(count(html, /class="new-badge"/g), 6); // "New this week" row plus each category section
  assert.deepEqual(nonAmazonImages(html), []);
});

test("every guide renders its picks plus the rest of the catalog field", async () => {
  for (const [slug, pickAsins] of Object.entries(picks)) {
    const response = await render(`/guides/${slug}`);
    const html = await response.text();
    const listing = catalog.listings[slug] ?? [];
    const pickSet = new Set(pickAsins);
    const rest = listing.filter((product) => !pickSet.has(product.asin)).length;

    assert.equal(response.status, 200, slug);
    assert.equal(count(html, /class="pick-card"/g), pickAsins.length, `${slug} pick cards`);
    assert.equal(count(html, /class="product-card"/g), rest, `${slug} product cards`);
    assert.equal(count(html, />Buy Now</g), pickAsins.length + rest, `${slug} Buy Now buttons`);
    assert.equal(count(html, /amazon\.com\/s\?/g), 0, `${slug} search links`);
    assert.deepEqual(nonAmazonImages(html), [], `${slug} images`);
    assert.doesNotMatch(html, /supplied HTML|uploaded HTML|source HTML|relevant products|source listing|exact ASIN/i, slug);
    assert.doesNotMatch(html, /<table\b/i, slug);
  }
});

test("renders the non-toxic air fryer guide with its filtered field", async () => {
  const response = await render("/guides/best-non-toxic-air-fryer");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Best Non-Toxic Air Fryer/i);
  assert.match(html, /article-jumpbar/i);
  assert.match(html, /B0FJYK886N/i);
  assert.match(html, />Good</i);
  assert.match(html, />Watch</i);
});

test("renders the crispy-tofu article with recipe schema", async () => {
  const response = await render("/guides/best-air-fryer-crispy-tofu-recipe");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /What you need—and what each ingredient does/i);
  assert.match(html, /"@type":"Recipe"/i);
});

test("renders the cleaning article with HowTo schema", async () => {
  const response = await render("/guides/best-way-to-clean-air-fryer");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /The 15-minute reset that prevents hard grease/i);
  assert.match(html, /"@type":"HowTo"/i);
});

test("renders the vacuum-sealer comparison with storage guidance", async () => {
  const response = await render("/guides/best-vacuum-sealer");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Food-storage safety/i);
  assert.match(html, /fda\.gov\/consumers\/consumer-updates\/are-you-storing-food-safely/i);
});

test("renders category hubs including the new wine-cooler and pizza-oven hubs", async () => {
  for (const slug of ["air-fryers", "blenders", "coffee-makers", "rice-cookers", "vacuum-sealers", "wine-coolers", "pizza-ovens"]) {
    const response = await render(`/categories/${slug}`);
    const html = await response.text();
    assert.equal(response.status, 200, slug);
    assert.match(html, /Three checks that decide the right/i, slug);
    assert.match(html, /The fundamentals/i, slug);
    assert.deepEqual(nonAmazonImages(html), [], slug);
  }
});

test("sitemap lists every guide and category", async () => {
  const response = await render("/sitemap.xml");
  const xml = await response.text();
  assert.equal(response.status, 200);
  for (const slug of Object.keys(picks)) assert.match(xml, new RegExp(`/guides/${slug}<`), slug);
  assert.match(xml, /\/categories\/wine-coolers</);
  assert.match(xml, /\/categories\/pizza-ovens</);
});
