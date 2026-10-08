import { describe, expect, it } from "vitest";
import { isEligible } from "./eligibility";

const monthPromo = { window: "month", windowDaysBefore: 0, windowDaysAfter: 0 } as const;
const dayPromo = (before: number, after: number) =>
  ({ window: "day", windowDaysBefore: before, windowDaysAfter: after }) as const;
const weekPromo = { window: "week", windowDaysBefore: 0, windowDaysAfter: 0 } as const;

describe("isEligible", () => {
  describe("month window", () => {
    it("ใช้ได้ทุกวันในเดือนเกิด", () => {
      expect(isEligible(monthPromo, { month: 10 }, new Date(2026, 9, 1))).toBe(true);
      expect(isEligible(monthPromo, { month: 10 }, new Date(2026, 9, 31))).toBe(true);
    });

    it("ใช้ไม่ได้นอกเดือนเกิด", () => {
      expect(isEligible(monthPromo, { month: 10 }, new Date(2026, 10, 1))).toBe(false);
    });
  });

  describe("day window", () => {
    it("ใช้ได้เฉพาะวันเกิดเมื่อไม่มีช่วงก่อน/หลัง", () => {
      const birth = { month: 10, day: 8 };
      expect(isEligible(dayPromo(0, 0), birth, new Date(2026, 9, 8))).toBe(true);
      expect(isEligible(dayPromo(0, 0), birth, new Date(2026, 9, 9))).toBe(false);
    });

    it("นับช่วงก่อนและหลังวันเกิด", () => {
      const birth = { month: 10, day: 8 };
      expect(isEligible(dayPromo(3, 7), birth, new Date(2026, 9, 5))).toBe(true);
      expect(isEligible(dayPromo(3, 7), birth, new Date(2026, 9, 4))).toBe(false);
      expect(isEligible(dayPromo(3, 7), birth, new Date(2026, 9, 15))).toBe(true);
      expect(isEligible(dayPromo(3, 7), birth, new Date(2026, 9, 16))).toBe(false);
    });

    it("ไม่รู้วันเกิด = ใช้ไม่ได้ (ต้องมีวันสำหรับโปรรายวัน)", () => {
      expect(isEligible(dayPromo(0, 0), { month: 10 }, new Date(2026, 9, 8))).toBe(false);
    });

    it("เกิด 31 ธ.ค. โปร +7 วัน ยังใช้ได้ 3 ม.ค. ปีถัดไป", () => {
      expect(isEligible(dayPromo(0, 7), { month: 12, day: 31 }, new Date(2027, 0, 3))).toBe(true);
    });

    it("เกิด 2 ม.ค. โปร -7 วัน ใช้ได้ตั้งแต่ 26 ธ.ค. ปีก่อน", () => {
      expect(isEligible(dayPromo(7, 0), { month: 1, day: 2 }, new Date(2026, 11, 26))).toBe(true);
      expect(isEligible(dayPromo(7, 0), { month: 1, day: 2 }, new Date(2026, 11, 25))).toBe(false);
    });

    it("เกิด 29 ก.พ. ปีที่ไม่มี 29 ก.พ. ถือวันเกิดเป็น 28 ก.พ.", () => {
      expect(isEligible(dayPromo(0, 0), { month: 2, day: 29 }, new Date(2027, 1, 28))).toBe(true);
      expect(isEligible(dayPromo(0, 0), { month: 2, day: 29 }, new Date(2027, 2, 1))).toBe(false);
    });
  });

  describe("week window", () => {
    it("ใช้ได้ 3 วันก่อนและหลังวันเกิด", () => {
      const birth = { month: 10, day: 8 };
      expect(isEligible(weekPromo, birth, new Date(2026, 9, 5))).toBe(true);
      expect(isEligible(weekPromo, birth, new Date(2026, 9, 11))).toBe(true);
      expect(isEligible(weekPromo, birth, new Date(2026, 9, 12))).toBe(false);
    });
  });
});
