// สร้าง app/favicon.ico และ app/apple-icon.png จาก app/icon.svg (รัน: npm run icons)
// ใช้สีโหมดสว่างของ icon.svg เพราะ PNG/ICO สลับธีมตามระบบไม่ได้
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const icon = readFileSync("app/icon.svg", "utf8");
const BG = "#FFF8F5"; // --bg โหมดสว่าง (docs/branding.md)

const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * (size / 32) * 4 }).resize(size, size).png().toBuffer();

// ICO ที่เก็บแต่ละขนาดเป็น PNG (รองรับทุกเบราว์เซอร์ปัจจุบัน)
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const sizes = [16, 32, 48];
const favicons = await Promise.all(sizes.map(async (size) => ({ size, data: await png(icon, size) })));
writeFileSync("app/favicon.ico", ico(favicons));

// iOS ไม่รองรับ SVG และเติมพื้นดำถ้าโปร่งใส จึงวางเทียนบนพื้น --bg เต็มแผ่น (iOS ตัดมุมให้เอง)
const inner = icon.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${BG}"/>
  <svg x="26" y="26" width="128" height="128" viewBox="0 0 32 32">${inner}</svg>
</svg>`;
const appleIcon = await sharp(Buffer.from(apple), { density: 288 }).resize(180, 180).flatten({ background: BG }).removeAlpha().png().toBuffer();
writeFileSync("app/apple-icon.png", appleIcon);

console.log("icons: app/favicon.ico (16/32/48), app/apple-icon.png (180)");
