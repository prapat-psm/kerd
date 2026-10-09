import { describe, expect, it } from "vitest";
import { formatThaiDate, isCurrent, periodLabel, toCardData, windowLabel, type PromoRow } from "./view";

describe("windowLabel", () => {
  it("โปรทั้งเดือน", () => {
    expect(windowLabel("month", 0, 0)).toBe("ใช้ได้ทั้งเดือนเกิด");
  });

  it("เฉพาะวันเกิด", () => {
    expect(windowLabel("day", 0, 0)).toBe("ใช้ได้เฉพาะวันเกิด");
  });

  it("ช่วงก่อนและหลังวันเกิด", () => {
    expect(windowLabel("day", 3, 7)).toBe("ใช้ได้ตั้งแต่ 3 วันก่อนวันเกิด ถึง 7 วันหลังวันเกิด");
  });

  it("ตั้งแต่วันเกิดไปอีกหลายวัน", () => {
    expect(windowLabel("day", 0, 7)).toBe("ใช้ได้ตั้งแต่วันเกิด ถึง 7 วันหลังวันเกิด");
  });

  it("ก่อนวันเกิดจนถึงวันเกิด", () => {
    expect(windowLabel("day", 5, 0)).toBe("ใช้ได้ตั้งแต่ 5 วันก่อนวันเกิด ถึงวันเกิด");
  });

  it("สัปดาห์วันเกิด", () => {
    expect(windowLabel("week", 0, 0)).toBe("ใช้ได้ในสัปดาห์วันเกิด (ก่อนและหลังวันเกิด 3 วัน)");
  });
});

describe("formatThaiDate", () => {
  it("แสดงวันที่แบบไทย พ.ศ. ตามเวลากรุงเทพ", () => {
    expect(formatThaiDate(new Date("2026-10-08T03:00:00Z"))).toBe("8 ต.ค. 2569");
    // 23:30 UTC ของวันที่ 7 = 06:30 วันที่ 8 ที่กรุงเทพ
    expect(formatThaiDate(new Date("2026-10-07T23:30:00Z"))).toBe("8 ต.ค. 2569");
  });
});

describe("isCurrent", () => {
  const today = new Date(2026, 9, 8, 12);

  it("โปรที่ไม่มีวันหมดอายุ แสดงตลอด", () => {
    expect(isCurrent({ validFrom: null, validUntil: null }, today)).toBe(true);
  });

  it("โปรที่หมดไปแล้ว ไม่แสดง", () => {
    expect(isCurrent({ validFrom: null, validUntil: new Date(2026, 9, 7) }, today)).toBe(false);
  });

  it("โปรที่หมดวันนี้ ยังแสดง", () => {
    expect(isCurrent({ validFrom: null, validUntil: new Date(2026, 9, 8) }, today)).toBe(true);
  });

  it("โปรที่ยังไม่เริ่ม ยังแสดง (การ์ดบอกวันเริ่ม)", () => {
    expect(isCurrent({ validFrom: new Date(2026, 11, 1), validUntil: null }, today)).toBe(true);
  });
});

describe("periodLabel", () => {
  const now = new Date("2026-10-08T03:00:00Z");

  it("ไม่มีช่วงเวลา ไม่ต้องแสดง", () => {
    expect(periodLabel(null, null, now)).toBeNull();
  });

  it("มีวันหมดอายุ บอกว่าใช้ได้ถึงวันไหน", () => {
    expect(periodLabel(null, new Date("2026-12-31T00:00:00+07:00"), now)).toBe("ใช้ได้ถึง 31 ธ.ค. 2569");
  });

  it("ยังไม่เริ่ม บอกวันเริ่ม", () => {
    expect(periodLabel(new Date("2026-11-01T00:00:00+07:00"), null, now)).toBe("เริ่ม 1 พ.ย. 2569");
    expect(periodLabel(new Date("2026-11-01T00:00:00+07:00"), new Date("2026-12-31T00:00:00+07:00"), now)).toBe(
      "เริ่ม 1 พ.ย. 2569 ใช้ได้ถึง 31 ธ.ค. 2569",
    );
  });

  it("เริ่มไปแล้ว ไม่ต้องบอกวันเริ่ม", () => {
    expect(periodLabel(new Date("2026-01-01T00:00:00+07:00"), null, now)).toBeNull();
  });
});

describe("toCardData", () => {
  const now = new Date("2026-10-08T03:00:00Z");
  const row: PromoRow = {
    id: "p1",
    title: "โปรวันเกิด MK",
    benefit: "เป็ดย่าง 1 จาน",
    window: "month",
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    tiers: [{ tier: "Gold", benefit: "เป็ดย่าง", conditions: [] }],
    requiresMembership: true,
    membershipName: "MK Member",
    requiredTier: null,
    conditions: ["ทานที่ร้าน"],
    howToRedeem: ["แสดงบัตรสมาชิก"],
    sourceUrl: "https://example.com/mk",
    validFrom: null,
    validUntil: null,
    lastVerifiedAt: new Date("2026-10-01T03:00:00Z"),
    brand: { name: "MK Restaurants", slug: "mk-restaurants", category: "food" },
    feedback: [],
  };

  it("รวมข้อมูลที่การ์ดต้องใช้ พร้อมสถานะความสด", () => {
    const card = toCardData(row, now);
    expect(card.freshness).toBe("fresh");
    expect(card.windowLabel).toBe("ใช้ได้ทั้งเดือนเกิด");
    expect(card.tiers).toEqual([{ tier: "Gold", benefit: "เป็ดย่าง", conditions: [] }]);
    expect(card.brand.slug).toBe("mk-restaurants");
  });

  it("ส่งช่วงที่ใช้ได้ (วัน/สัปดาห์/เดือน) และช่วงเวลาของโปรไปให้ตัวกรองและการ์ด", () => {
    expect(toCardData(row, now)).toMatchObject({ window: "month", period: null });
    expect(toCardData({ ...row, window: "day", validUntil: new Date("2026-12-31T00:00:00+07:00") }, now)).toMatchObject({
      window: "day",
      period: "ใช้ได้ถึง 31 ธ.ค. 2569",
    });
  });

  it("นับเฉพาะ feedback ที่บอกว่าใช้ไม่ได้ เป็น downvote", () => {
    const votes = Array.from({ length: 7 }, (_, i) => ({ stillValid: false, createdAt: new Date(`2026-10-0${i + 2}T03:00:00Z`) }));
    expect(toCardData({ ...row, feedback: votes }, now).freshness).toBe("warn");
    const ok = votes.map((v) => ({ ...v, stillValid: true }));
    expect(toCardData({ ...row, feedback: ok }, now).freshness).toBe("fresh");
  });

  it("tiers ใน DB ที่รูปแบบไม่ถูกต้อง จะไม่แสดง แทนที่จะทำให้หน้าพัง", () => {
    expect(toCardData({ ...row, tiers: { bad: true } }, now).tiers).toBeNull();
    expect(toCardData({ ...row, tiers: null }, now).tiers).toBeNull();
  });
});
