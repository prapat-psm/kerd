import { describe, expect, it } from "vitest";
import { PromotionInput } from "./promotion";

const valid = {
  brandSlug: "mk-restaurants",
  title: "คูปองวันเกิด MK Member",
  benefit: "รับคูปองส่วนลดในเดือนเกิด",
  benefitType: "other",
  window: "month",
  sourceUrl: "https://www.mkrestaurant.com/",
  howToRedeem: ["สมัคร MK Member", "แสดงบัตรสมาชิกในเดือนเกิด"],
  verifyMethod: "auto",
};

describe("PromotionInput", () => {
  it("ผ่านเมื่อข้อมูลครบ และเติมค่า default", () => {
    const p = PromotionInput.parse(valid);
    expect(p.windowDaysBefore).toBe(0);
    expect(p.windowDaysAfter).toBe(0);
    expect(p.requiredDocs).toEqual([]);
    expect(p.requiredTier).toBeNull();
    expect(p.validUntil).toBeNull();
  });

  it("บังคับ sourceUrl เป็น https", () => {
    expect(PromotionInput.safeParse({ ...valid, sourceUrl: "http://example.com" }).success).toBe(false);
    expect(PromotionInput.safeParse({ ...valid, sourceUrl: "not a url" }).success).toBe(false);
  });

  it("บังคับ howToRedeem อย่างน้อย 1 ขั้น", () => {
    expect(PromotionInput.safeParse({ ...valid, howToRedeem: [] }).success).toBe(false);
  });

  it("ไม่รับ window ที่ไม่รู้จัก", () => {
    expect(PromotionInput.safeParse({ ...valid, window: "year" }).success).toBe(false);
  });

  it("รับ requiredTier และ validUntil (วันที่ ISO)", () => {
    const p = PromotionInput.parse({ ...valid, requiredTier: "Gold", validUntil: "2026-12-31" });
    expect(p.requiredTier).toBe("Gold");
    expect(p.validUntil).toEqual(new Date("2026-12-31"));
  });

  it("ไม่รับ validFrom ที่อยู่หลัง validUntil", () => {
    const r = PromotionInput.safeParse({ ...valid, validFrom: "2027-01-01", validUntil: "2026-12-31" });
    expect(r.success).toBe(false);
  });
});
