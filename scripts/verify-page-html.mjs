import http from "node:http";

function checkUrl(url) {
  http.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log(`Redirecting to: ${res.headers.location}`);
      return checkUrl(new URL(res.headers.location, url).href);
    }
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`HTML Length: ${data.length} bytes`);
      console.log(`Contains h1: ${data.includes("17 Best Blender Food Processor Combos in 2026")}`);
      console.log(`Contains Amazon buttons / links: ${data.includes("tag=visitbest07-20")}`);
      console.log(`Contains comparison table: ${data.includes("<table") || data.includes("Quick picks")}`);
      console.log(`Contains FAQ section: ${data.toLowerCase().includes("frequently asked questions") && data.includes("Can a blender replace a food processor?")}`);
      console.log(`Image URLs in HTML count: ${(data.match(/m\.media-amazon\.com/g) || []).length}`);
    });
  }).on("error", (err) => {
    console.error("HTTP fetch error:", err.message);
  });
}

checkUrl("http://localhost:3000/best-blender-food-processor-combo");
