import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// ไอคอนเว็บ (Next.js file convention): icon.svg สำหรับเบราว์เซอร์ใหม่, favicon.ico สำรอง, apple-icon.png สำหรับ iOS
// สร้างไฟล์ PNG/ICO ใหม่จาก icon.svg ด้วย `npm run icons`
const read = (file: string) => readFileSync(join(process.cwd(), "app", file));
const branding = readFileSync(join(process.cwd(), "docs/branding.md"), "utf8");
const brand = branding.match(/^\|\s*`--brand`\s*\|[^|]*\|\s*`(#[0-9A-Fa-f]{6})`[^|]*\|\s*`(#[0-9A-Fa-f]{6})`/m)!;
const [lightBrand, darkBrand] = [brand[1].toLowerCase(), brand[2].toLowerCase()];

describe("icon.svg", () => {
  const svg = read("icon.svg").toString("utf8").toLowerCase();

  it("ใช้สี coral ของแบรนด์ในโหมดสว่าง", () => {
    expect(svg).toContain(lightBrand);
  });

  it("เปลี่ยนเป็น coral โหมดมืดเมื่อระบบเป็น dark", () => {
    const dark = svg.slice(svg.indexOf("@media (prefers-color-scheme: dark)"));
    expect(svg).toContain("@media (prefers-color-scheme: dark)");
    expect(dark).toContain(darkBrand);
  });

  it("เป็นตาราง 32x32 เพื่อให้คมที่ 16px และ 32px", () => {
    expect(svg).toContain('viewbox="0 0 32 32"');
  });
});

describe("apple-icon.png", () => {
  const png = read("apple-icon.png");

  it("เป็น PNG ขนาด 180x180", () => {
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([180, 180]);
  });

  it("ไม่มีพื้นโปร่งใส (iOS เติมพื้นดำให้ถ้าโปร่ง)", () => {
    const colorType = png[25];
    expect(colorType === 2 || colorType === 0).toBe(true);
  });
});

describe("favicon.ico", () => {
  const ico = read("favicon.ico");

  it("มีขนาด 16, 32 และ 48px", () => {
    expect(ico.readUInt16LE(2)).toBe(1);
    const count = ico.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => ico[6 + i * 16] || 256);
    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48]);
  });

  it("เก็บภาพเป็น PNG ที่สร้างจาก icon.svg ไม่ใช่ไอคอนเริ่มต้นของ Next.js", () => {
    const offset = ico.readUInt32LE(6 + 12);
    expect(ico.subarray(offset + 1, offset + 4).toString("ascii")).toBe("PNG");
  });
});

describe.each(["opengraph-image.png", "twitter-image.png"])("%s", (file) => {
  const png = read(file);

  it("เป็น PNG 1200x630 ตามขนาดที่ Facebook/LINE/X แนะนำ และไม่เกิน 300KB", () => {
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(png.length).toBeLessThan(300_000);
  });

  it("มีข้อความ alt", () => {
    expect(read(file.replace(".png", ".alt.txt")).toString("utf8")).toContain("Kerd");
  });
});
