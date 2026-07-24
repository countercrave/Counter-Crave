const asin = String(process.argv[2] || "").trim().toUpperCase();
const tag =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "visitbest07-20";

if (!/^[A-Z0-9]{10}$/.test(asin)) {
  console.error(
    "Usage: npm run amazon:link -- B0XXXXXXXX\\nASIN must contain exactly 10 letters/numbers.",
  );
  process.exit(1);
}

const url = new URL(`https://www.amazon.com/dp/${asin}/ref=nosim`);
url.searchParams.set("tag", tag);

console.log(url.toString());
