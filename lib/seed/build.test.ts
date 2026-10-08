import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPocSeed } from "./build";

const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("buildPocSeed", () => {
  it("ได้ 1 แบรนด์ต่อ 1 โปร เฉพาะ record ที่ผ่าน", () => {
    const { rows } = buildPocSeed(raw);
    expect(rows).toHaveLength(16);
    expect(new Set(rows.map((r) => r.brand.slug)).size).toBe(16);
  });

  it("เอาชื่อและหมวดของแบรนด์จากไฟล์ต้นทาง", () => {
    const mk = buildPocSeed(raw).rows.find((r) => r.brand.slug === "mk-restaurants");
    expect(mk?.brand).toEqual({ slug: "mk-restaurants", name: "MK Restaurants", category: "food" });
  });

  it("โปรเริ่มเป็น draft และยังไม่ถือว่าตรวจแล้ว จนกว่าคนจะยืนยัน", () => {
    for (const { promotion } of buildPocSeed(raw).rows) {
      expect(promotion.status).toBe("draft");
      expect(promotion.lastVerifiedAt).toBeNull();
      expect(promotion).not.toHaveProperty("brandSlug");
    }
  });

  it("ไม่ส่ง tiers เมื่อไม่มี tier (ให้ DB เป็น NULL)", () => {
    const { rows } = buildPocSeed(raw);
    for (const { promotion } of rows) {
      if (promotion.tiers !== undefined) expect(Array.isArray(promotion.tiers)).toBe(true);
    }
    expect(rows.some((r) => r.promotion.tiers === undefined)).toBe(true);
  });

  it("ส่งรายการที่ถูกข้ามออกมาด้วย", () => {
    expect(buildPocSeed(raw).skipped).toHaveLength(4);
  });
});
