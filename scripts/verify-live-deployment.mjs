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

async function verify() {
  console.log("=== VERCEL PRODUCTION DEPLOYMENT VERIFICATION ===");
  const base = "https://countercrave.com";

  // 1. Homepage
  const home = await fetchUrl(`${base}/`);
  console.log("Homepage status:", home.status);
  console.log("Homepage has 34 guides:", home.body ? home.body.includes("34") && home.body.includes("long-form guides") : false);
  console.log("Homepage has 625 placements:", home.body ? home.body.includes("625") && home.body.includes("source product placements") : false);

  // 2. Guides Index
  const guides = await fetchUrl(`${base}/guides`);
  console.log("Guides index status:", guides.status);
  console.log("Guides index has 34 guides:", guides.body ? /34.*complete kitchen guides/i.test(guides.body) : false);

  // 3. Category Routes
  const afCat = await fetchUrl(`${base}/categories/air-fryers`);
  console.log("Air Fryers category status:", afCat.status);
  const blCat = await fetchUrl(`${base}/categories/blenders`);
  console.log("Blenders category status:", blCat.status);

  // 4. Key Guides
  const nonToxic = await fetchUrl(`${base}/guides/best-non-toxic-air-fryer`);
  console.log("Best Non-Toxic Air Fryer status:", nonToxic.status);
  console.log("Non-Toxic has 24 products:", nonToxic.body ? (nonToxic.body.match(/class="source-product-card"/g) || []).length === 24 : false);
  console.log("Non-Toxic has Article Schema:", nonToxic.body ? nonToxic.body.includes('"@type":"Article"') : false);

  const thighs = await fetchUrl(`${base}/guides/best-air-fryer-chicken-thighs`);
  console.log("Chicken Thighs status:", thighs.status);
  console.log("Chicken Thighs has 61 products:", thighs.body ? (thighs.body.match(/class="source-product-card"/g) || []).length === 61 : false);

  const tofu = await fetchUrl(`${base}/guides/best-air-fryer-crispy-tofu-recipe`);
  console.log("Crispy Tofu Recipe status:", tofu.status);
  console.log("Tofu has Recipe Schema:", tofu.body ? tofu.body.includes('"@type":"Recipe"') : false);

  const clean = await fetchUrl(`${base}/guides/best-way-to-clean-air-fryer`);
  console.log("Cleaning guide status:", clean.status);
  console.log("Cleaning has HowTo Schema:", clean.body ? clean.body.includes('"@type":"HowTo"') : false);

  const things = await fetchUrl(`${base}/guides/best-things-to-cook-in-air-fryer`);
  console.log("Things to cook status:", things.status);

  // 5. Robots.txt
  const robots = await fetchUrl(`${base}/robots.txt`);
  console.log("Robots.txt status:", robots.status);
  console.log("Robots points to sitemap:", robots.body ? robots.body.includes("https://countercrave.com/sitemap.xml") : false);

  // 6. Sitemap.xml
  const sitemap = await fetchUrl(`${base}/sitemap.xml`);
  console.log("Sitemap.xml status:", sitemap.status);
  console.log("Sitemap valid XML:", sitemap.body ? sitemap.body.includes("<urlset") : false);
  console.log("Sitemap has NO .html URLs:", sitemap.body ? !sitemap.body.includes(".html") : false);
  console.log("Sitemap canonicals domain:", sitemap.body ? sitemap.body.includes("https://countercrave.com/") : false);

  // 7. Non-existent slug returns 404
  const notFound = await fetchUrl(`${base}/guides/nonexistent-slug-xyz`);
  console.log("Non-existent guide returns 404:", notFound.status === 404);

  // 8. Legacy .html redirects
  const redir1 = await fetchUrl(`${base}/best-non-toxic-air-fryer.html`);
  console.log("Redirect /best-non-toxic-air-fryer.html:", redir1.status, "->", redir1.location);
  const redir2 = await fetchUrl(`${base}/guides/best-non-toxic-air-fryer.html`);
  console.log("Redirect /guides/best-non-toxic-air-fryer.html:", redir2.status, "->", redir2.location);
  const redir3 = await fetchUrl(`${base}/air-fryers.html`);
  console.log("Redirect /air-fryers.html:", redir3.status, "->", redir3.location);

  // 9. Unknown .html returns 404
  const unknownHtml = await fetchUrl(`${base}/random-file-xyz.html`);
  console.log("Random .html returns 404:", unknownHtml.status === 404);
}

verify();
