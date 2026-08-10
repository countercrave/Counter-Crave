import fs from "node:fs";
import path from "node:path";

function checkHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");
  const hasNoindex = content.includes('name="robots" content="noindex, nofollow');
  console.log(`${path.basename(filePath)} has <meta name="robots" content="noindex, nofollow">: ${hasNoindex}`);
}

const serverDir = path.join(process.cwd(), ".next", "server", "app");
checkHtmlFile(path.join(serverDir, "index.html"));
checkHtmlFile(path.join(serverDir, "best-blender-food-processor-combo.html"));
