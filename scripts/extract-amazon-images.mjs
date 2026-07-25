import fs from "node:fs";

const files = [
  "C:/Users/PC/.cursor/projects/c-Users-PC-Desktop-Affilate-Work-countercrave-upload-tmp-countercrave-nextjs/agent-tools/0e964586-e242-4311-bd5b-6668b8cd3a72.txt",
  "C:/Users/PC/.cursor/projects/c-Users-PC-Desktop-Affilate-Work-countercrave-upload-tmp-countercrave-nextjs/agent-tools/0ef7ea0f-0ab2-4f08-a629-27d9e65cd9ee.txt",
];

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const hiRes = html.match(
    /"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+_AC_SL1500_\.jpg)"/,
  );
  const asin =
    html.match(/"current_asin"\s*:\s*"([A-Z0-9]{10})"/i)?.[1] ||
    html.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ||
    "?";
  console.log(asin, hiRes?.[1] || "NO_IMAGE");
}
