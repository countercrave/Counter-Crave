import fs from "node:fs";
import path from "node:path";

const sourceImage = "C:/Users/PC/.gemini/antigravity/brain/3b52eb5c-fbbe-4056-a417-94f9909f84f5/birthday_countdown_og_image_1786469746957.jpg";

const targetOg = path.join(process.cwd(), "public", "og-image.png");
const targetHero = path.join(process.cwd(), "public", "images", "birthday-countdown-calculator-hero.jpg");

if (!fs.existsSync(path.dirname(targetHero))) {
  fs.mkdirSync(path.dirname(targetHero), { recursive: true });
}

fs.copyFileSync(sourceImage, targetOg);
fs.copyFileSync(sourceImage, targetHero);

console.log("Successfully copied featured image to public/og-image.png and public/images/birthday-countdown-calculator-hero.jpg!");
