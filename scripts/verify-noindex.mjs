import http from "node:http";

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(checkUrl(new URL(res.headers.location, url).href));
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({ status: res.statusCode, body: data });
      });
    }).on("error", (err) => resolve({ error: err.message }));
  });
}

async function run() {
  const article = await checkUrl("http://localhost:3000/best-blender-food-processor-combo/");
  console.log("Article status:", article.status);
  const metas = (article.body.match(/<meta[^>]+>/g) || []);
  console.log("Meta tags found:", metas);
}

run();
