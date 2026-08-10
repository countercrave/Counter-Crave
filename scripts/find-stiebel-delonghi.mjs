import https from "node:https";

function searchAmazon(query) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

async function run() {
  console.log("Searching Stiebel Eltron...");
  const sHtml = await searchAmazon("Stiebel Eltron CK 20E Trend");
  const sAsins = sHtml.match(/data-asin="([A-Z0-9]{10})"/g) || [];
  const sImages = sHtml.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
  console.log("Stiebel ASINs:", sAsins.slice(0, 5));
  console.log("Stiebel Images:", sImages.slice(0, 5));

  console.log("Searching DeLonghi...");
  const dHtml = await searchAmazon("DeLonghi HVF3555TB");
  const dAsins = dHtml.match(/data-asin="([A-Z0-9]{10})"/g) || [];
  const dImages = dHtml.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\-]+\.jpg/g) || [];
  console.log("DeLonghi ASINs:", dAsins.slice(0, 5));
  console.log("DeLonghi Images:", dImages.slice(0, 5));
}

run();
