import { describe, expect, it } from "vitest";
import { MONTHS, monthFromSlug, nextOccurrence } from "./months";

describe("MONTHS", () => {
  it("มี 12 เดือน เรียงตามลำดับ พร้อม slug และชื่อไทย", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toEqual({ month: 1, slug: "january", th: "มกราคม" });
    expect(MONTHS[9]).toEqual({ month: 10, slug: "october", th: "ตุลาคม" });
  });
});

describe("monthFromSlug", () => {
  it("แปลง slug เป็นเลขเดือน", () => {
    expect(monthFromSlug("february")).toBe(2);
    expect(monthFromSlug("december")).toBe(12);
  });

  it("slug ที่ไม่รู้จักคืน null", () => {
    expect(monthFromSlug("10")).toBeNull();
    expect(monthFromSlug("October")).toBeNull();
  });
});

describe("nextOccurrence", () => {
  const today = new Date(2026, 9, 8); // 8 ต.ค. 2026

  it("เดือนปัจจุบัน = ทั้งเดือนของปีนี้", () => {
    expect(nextOccurrence(10, today)).toEqual({ start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) });
  });

  it("เดือนที่ยังมาไม่ถึง = ปีนี้", () => {
    expect(nextOccurrence(12, today).start).toEqual(new Date(2026, 11, 1));
  });

  it("เดือนที่ผ่านไปแล้ว = ปีหน้า", () => {
    expect(nextOccurrence(2, today)).toEqual({ start: new Date(2027, 1, 1), end: new Date(2027, 1, 28) });
  });
});
