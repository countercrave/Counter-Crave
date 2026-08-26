import https from "node:https";

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
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
    }).on("error", (err) => resolve({ error: err.message }));
  });
}

function countH1(html) {
  const matches = html ? html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) : null;
  return matches ? matches.length : 0;
}

async function verifyLive() {
  console.log("=== LIVE PRODUCTION DEPLOYMENT VERIFICATION (COUNTERCRAVE.COM) ===");
  const base = "https://countercrave.com";

  // 1. Recipes Hub
  const hub = await fetchUrl(`${base}/recipes`);
  console.log("1. /recipes status:", hub.status, "| H1 count:", countH1(hub.body));
  console.log("   /recipes canonical:", hub.body?.includes('rel="canonical"') && hub.body?.includes("/recipes"));
  console.log("   /recipes CollectionPage schema:", hub.body?.includes("CollectionPage"));
  console.log("   /recipes ItemList schema:", hub.body?.includes("ItemList"));

  // 2. 18 Easy 30-Minute Dinners
  const dinners = await fetchUrl(`${base}/guides/easy-30-minute-dinner-ideas`);
  console.log("2. /guides/easy-30-minute-dinner-ideas status:", dinners.status, "| H1 count:", countH1(dinners.body));
  console.log("   18 dinner cards rendered:", (dinners.body?.match(/class="dinner-card"/g) || []).length === 18);
  console.log("   Recipe schemas present:", dinners.body?.includes('"@type":"Recipe"'));
  console.log("   FAQPage schema present:", dinners.body?.includes('"@type":"FAQPage"'));

  // 3. Crispy Roast Potatoes
  const potatoes = await fetchUrl(`${base}/guides/crispy-roast-potatoes-recipe`);
  console.log("3. /guides/crispy-roast-potatoes-recipe status:", potatoes.status, "| H1 count:", countH1(potatoes.body));
  console.log("   Recipe schema:", potatoes.body?.includes('"@type":"Recipe"'));
  console.log("   Scaling tools present:", potatoes.body?.includes("recipe-card"));

  // 4. Prime Rib
  const rib = await fetchUrl(`${base}/guides/prime-rib-recipe`);
  console.log("4. /guides/prime-rib-recipe status:", rib.status, "| H1 count:", countH1(rib.body));
  console.log("   USDA safety context:", rib.body?.includes("145°F") || rib.body?.includes("USDA"));

  // 5. Cheesecake
  const cake = await fetchUrl(`${base}/guides/no-bake-cheesecake-recipe`);
  console.log("5. /guides/no-bake-cheesecake-recipe status:", cake.status, "| H1 count:", countH1(cake.body));

  // 6. Pancakes
  const pancakes = await fetchUrl(`${base}/guides/fluffy-buttermilk-pancake-recipe`);
  console.log("6. /guides/fluffy-buttermilk-pancake-recipe status:", pancakes.status, "| H1 count:", countH1(pancakes.body));

  // 7. Check WebP images
  const sampleImages = [
    "30-minute-dinners-hero.webp",
    "crispy-roast-potatoes-hero.webp",
    "prime-rib-hero.webp",
    "no-bake-cheesecake-hero.webp",
    "fluffy-buttermilk-pancakes-hero.webp",
    "og-countercrave-recipes.webp"
  ];
  let imagesOk = true;
  for (const img of sampleImages) {
    const res = await fetchUrl(`${base}/images/recipes/${img}`);
    if (res.status !== 200) {
      imagesOk = false;
      console.log(`   Image error for ${img}:`, res.status);
    }
  }
  console.log("7. Recipe WebP images status 200:", imagesOk);

  // 8. Sitemap
  const sitemap = await fetchUrl(`${base}/sitemap.xml`);
  console.log("8. /sitemap.xml status:", sitemap.status);
  console.log("   Contains /recipes:", sitemap.body?.includes("https://countercrave.com/recipes"));
  console.log("   Contains 30-min dinners:", sitemap.body?.includes("https://countercrave.com/guides/easy-30-minute-dinner-ideas"));
  console.log("   Contains roast potatoes:", sitemap.body?.includes("https://countercrave.com/guides/crispy-roast-potatoes-recipe"));
  console.log("   Contains prime rib:", sitemap.body?.includes("https://countercrave.com/guides/prime-rib-recipe"));
  console.log("   Contains cheesecake:", sitemap.body?.includes("https://countercrave.com/guides/no-bake-cheesecake-recipe"));
  console.log("   Contains pancakes:", sitemap.body?.includes("https://countercrave.com/guides/fluffy-buttermilk-pancake-recipe"));

  // 9. Regressions
  const home = await fetchUrl(`${base}/`);
  console.log("9. Homepage status:", home.status);
  const airfryers = await fetchUrl(`${base}/categories/air-fryers`);
  console.log("   /categories/air-fryers status:", airfryers.status);
  const notFound = await fetchUrl(`${base}/guides/nonexistent-xyz`);
  console.log("   404 on nonexistent guide:", notFound.status === 404);
}

verifyLive();
