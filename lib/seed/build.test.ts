import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPocSeed } from "./build";

const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("buildPocSeed", () => {
  it("ได้ 1 แบรนด์ต่อ 1 โปร เฉพาะ record ที่ผ่าน", () => {
    const { rows } = buildPocSeed(raw);
    expect(rows).toHaveLength(23);
    expect(new Set(rows.map((r) => r.brand.slug)).size).toBe(23);
  });

  it("เอาชื่อและหมวดของแบรนด์จากไฟล์ต้นทาง", () => {
    const mk = buildPocSeed(raw).rows.find((r) => r.brand.slug === "mk-restaurants");
    expect(mk?.brand).toEqual({ slug: "mk-restaurants", name: "MK Restaurants", category: "food" });
  });

  it("โปรเริ่มเป็น draft และยังไม่ถือว่าตรวจแล้ว จนกว่าคนจะยืนยัน", () => {
    for (const { promotion } of buildPocSeed(raw).rows.filter((r) => r.promotion.status === "draft")) {
      expect(promotion.lastVerifiedAt).toBeNull();
      expect(promotion).not.toHaveProperty("brandSlug");
    }
  });

  it("เผยแพร่เฉพาะ record ที่คนอนุมัติ (publish: true) โดยใช้วันที่ตรวจต้นทางเป็นวันตรวจล่าสุด", () => {
    const published = buildPocSeed(raw).rows.filter((r) => r.promotion.status === "published");
    expect(published.map((r) => r.brand.slug).sort()).toEqual(
      ["aeon-th", "bar-b-q-plaza", "gsb-credit-card", "laneige-th", "pizza-hut-th", "uniqlo-th", "watsons-th"],
    );
    const verifiedAt = Object.fromEntries(published.map((r) => [r.brand.slug, r.promotion.lastVerifiedAt]));
    expect(verifiedAt["watsons-th"]).toEqual(new Date("2026-10-08"));
    expect(verifiedAt["laneige-th"]).toEqual(new Date("2026-10-09"));
  });

  it("ไม่เผยแพร่ record ที่ confidence ไม่สูง แม้จะติด publish: true", () => {
    const base = { slug: "x", brand: "X", category: "food", title: "X", benefit: "ลด 10%", benefit_type: "other", window: "month" };
    const rec = { ...base, source_url: "https://x.com", how_to_redeem: ["แสดงบัตร"], verify_method: "auto", source_checked_at: "2026-10-08" };
    const { rows } = buildPocSeed([{ ...rec, confidence: "medium", publish: true }]);
    expect(rows[0].promotion.status).toBe("draft");
  });

  it("ไม่ส่ง tiers เมื่อไม่มี tier (ให้ DB เป็น NULL)", () => {
    const { rows } = buildPocSeed(raw);
    for (const { promotion } of rows) {
      if (promotion.tiers !== undefined) expect(Array.isArray(promotion.tiers)).toBe(true);
    }
    expect(rows.some((r) => r.promotion.tiers === undefined)).toBe(true);
  });

  it("ส่งรายการที่ถูกข้ามออกมาด้วย", () => {
    expect(buildPocSeed(raw).skipped).toHaveLength(7);
  });
});
