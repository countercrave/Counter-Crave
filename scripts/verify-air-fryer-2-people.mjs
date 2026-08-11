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
  const page = await checkUrl("http://localhost:3000/best-air-fryer-for-2-people/");
  console.log("Status Code:", page.status);
  console.log("Title present:", page.body ? page.body.includes("Best Air Fryer for 2 People") : false);
  console.log("Product cards count:", page.body ? (page.body.match(/Check price on Amazon/g) || []).length : 0);
  console.log("Image count:", page.body ? (page.body.match(/m\.media-amazon\.com/g) || []).length : 0);
}

run();
