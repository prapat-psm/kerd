import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePocBrands } from "./poc";

const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("parsePocBrands", () => {
  it("ข้าม record ที่ยังไม่พร้อมเผยแพร่ (Starbucks, After You)", () => {
    const { skipped } = parsePocBrands(raw);
    expect(skipped.map((s) => s.slug).sort()).toEqual(["after-you", "starbucks-th"]);
  });

  it("แปลง record ที่ใช้ได้เป็น PromotionInput", () => {
    const { valid } = parsePocBrands(raw);
    expect(valid).toHaveLength(8);
    const mk = valid.find((p) => p.brandSlug === "mk-restaurants");
    expect(mk?.howToRedeem.length).toBeGreaterThan(0);
    expect(mk?.sourceUrl).toMatch(/^https:\/\//);
  });

  it("บอกเหตุผลที่ข้าม", () => {
    const { skipped } = parsePocBrands([
      { slug: "x", brand: "X", confidence: "high", how_to_redeem: [], benefit: "a", source_url: "https://x.com" },
    ]);
    expect(skipped[0].reason).toMatch(/howToRedeem/);
  });
});
