import { describe, expect, it } from "vitest";
import { freshnessStatus } from "./freshness";

const now = new Date(2026, 9, 8);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("freshnessStatus", () => {
  it("ตรวจภายใน 30 วัน = fresh", () => {
    expect(freshnessStatus({ lastVerifiedAt: daysAgo(30), downvoteDates: [] }, now)).toBe("fresh");
  });

  it("ตรวจเกิน 30 วัน = due", () => {
    expect(freshnessStatus({ lastVerifiedAt: daysAgo(31), downvoteDates: [] }, now)).toBe("due");
  });

  it("ยังไม่เคยตรวจ = due", () => {
    expect(freshnessStatus({ lastVerifiedAt: null, downvoteDates: [] }, now)).toBe("due");
  });

  it("👎 ครบ 7 ครั้งภายใน 7 วัน = warn แม้เพิ่งตรวจ", () => {
    const votes = Array.from({ length: 7 }, (_, i) => daysAgo(i));
    expect(freshnessStatus({ lastVerifiedAt: daysAgo(1), downvoteDates: votes }, now)).toBe("warn");
  });

  it("👎 ที่เก่ากว่า 7 วันไม่นับ", () => {
    const votes = [...Array.from({ length: 6 }, (_, i) => daysAgo(i)), daysAgo(8)];
    expect(freshnessStatus({ lastVerifiedAt: daysAgo(1), downvoteDates: votes }, now)).toBe("fresh");
  });

  it("👎 ก่อนการตรวจล่าสุดไม่นับ (ตรวจแล้วถือว่าแก้แล้ว)", () => {
    const votes = Array.from({ length: 7 }, (_, i) => daysAgo(2 + i * 0.5));
    expect(freshnessStatus({ lastVerifiedAt: daysAgo(1), downvoteDates: votes }, now)).toBe("fresh");
  });
});
