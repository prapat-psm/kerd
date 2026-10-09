import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePocBrands } from "./poc";

const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("parsePocBrands", () => {
  it("ข้าม record ที่ยังไม่พร้อมเผยแพร่: confidence ต่ำ หรือไม่รู้ว่าได้อะไร", () => {
    const { skipped } = parsePocBrands(raw);
    // Starbucks, After You, True, Krungsri, ttb = confidence ต่ำ; Swensen's = รายละเอียดสิทธิ์อยู่ในแอปเท่านั้น (benefit เป็น null)
    expect(skipped.map((s) => s.slug).sort()).toEqual(["after-you", "krungsri", "starbucks-th", "swensens", "true-privilege", "ttb"]);
  });

  it("แปลง record ที่ใช้ได้เป็น PromotionInput", () => {
    const { valid } = parsePocBrands(raw);
    expect(valid).toHaveLength(20);
    const mk = valid.find((p) => p.brandSlug === "mk-restaurants");
    expect(mk?.howToRedeem.length).toBeGreaterThan(0);
    expect(mk?.sourceUrl).toMatch(/^https:\/\//);
  });

  it("ตัด tier ที่ยังไม่รู้ว่าได้อะไรออก แทนที่จะทิ้งทั้งโปร", () => {
    const { valid } = parsePocBrands([
      {
        slug: "x",
        title: "X",
        benefit: "ส่วนลด",
        benefit_type: "other",
        window: "month",
        source_url: "https://x.com",
        how_to_redeem: ["แสดงบัตร"],
        verify_method: "auto",
        tiers: [
          { tier: "Gold", benefit: "ลด 20%", conditions: [] },
          { tier: "Classic", benefit: null, conditions: [] },
        ],
      },
    ]);
    expect(valid[0].tiers).toEqual([{ tier: "Gold", benefit: "ลด 20%", conditions: [] }]);
  });

  it("บอกเหตุผลที่ข้าม", () => {
    const { skipped } = parsePocBrands([
      { slug: "x", brand: "X", confidence: "high", how_to_redeem: [], benefit: "a", source_url: "https://x.com" },
    ]);
    expect(skipped[0].reason).toMatch(/howToRedeem/);
  });
});
