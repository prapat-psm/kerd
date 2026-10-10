// สร้าง app/favicon.ico, app/apple-icon.png และไอคอน PWA ใน public/icons จาก app/icon.svg (รัน: npm run icons)
// ใช้สีโหมดสว่างของ icon.svg เพราะ PNG/ICO สลับธีมตามระบบไม่ได้
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

// ไอคอนทึบบนพื้น --bg เต็มแผ่น: iOS เติมพื้นดำถ้าโปร่งใส ส่วน Android ตัดขอบไอคอน maskable เอง
// scale = สัดส่วนเทียนต่อด้าน; maskable ต้องอยู่ในวงกลม safe zone 80% จึงเล็กกว่า
const inner = icon.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const tile = (size, scale) => {
  const art = Math.round(size * scale);
  const at = Math.round((size - art) / 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <svg x="${at}" y="${at}" width="${art}" height="${art}" viewBox="0 0 32 32">${inner}</svg>
</svg>`;
  return sharp(Buffer.from(svg), { density: 288 }).resize(size, size).flatten({ background: BG }).removeAlpha().png().toBuffer();
};

writeFileSync("app/apple-icon.png", await tile(180, 128 / 180));

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", await tile(192, 128 / 180));
writeFileSync("public/icons/icon-512.png", await tile(512, 128 / 180));
writeFileSync("public/icons/icon-maskable-512.png", await tile(512, 0.56));

console.log("icons: app/favicon.ico (16/32/48), app/apple-icon.png (180), public/icons (192, 512, maskable 512)");
