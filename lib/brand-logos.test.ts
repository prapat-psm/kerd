import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_LOGOS, brandLogo } from "./brand-logos";

// ใช้โลโก้จริงได้เฉพาะแบรนด์ที่อนุญาตเป็นลายลักษณ์อักษร (docs/branding.md) ที่เหลือใช้อักษรย่อ
describe("brand logos", () => {
  it("ทุกโลโก้ต้องมีหลักฐานการอนุญาต และไฟล์อยู่ใน public/brand-logos", () => {
    for (const [slug, logo] of Object.entries(BRAND_LOGOS)) {
      expect(logo.permission.trim(), slug).not.toBe("");
      expect(logo.src, slug).toMatch(/^\/brand-logos\/[a-z0-9-]+\.(svg|png|webp)$/);
      expect(existsSync(`public${logo.src}`), slug).toBe(true);
    }
  });

  it("แบรนด์ที่ไม่ได้อนุญาตไม่มีโลโก้", () => {
    expect(brandLogo("not-a-brand")).toBeNull();
  });
});
