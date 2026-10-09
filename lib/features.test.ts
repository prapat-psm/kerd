import { describe, expect, it } from "vitest";
import { LINE_REMINDERS_ENABLED, lineRemindersOn } from "./features";

const env = { AUTH_SECRET: "s", AUTH_LINE_ID: "i", AUTH_LINE_SECRET: "x" };

describe("LINE reminders feature flag", () => {
  it("ปิดไว้ก่อน (Prapat ขอพักเรื่อง LINE 2026-10-09)", () => {
    expect(LINE_REMINDERS_ENABLED).toBe(false);
  });

  it("ปิดอยู่แม้ตั้ง env ครบ", () => {
    expect(lineRemindersOn(env)).toBe(false);
  });

  it("เปิดเมื่อเปิด flag และตั้ง env ครบเท่านั้น", () => {
    expect(lineRemindersOn(env, true)).toBe(true);
    expect(lineRemindersOn({}, true)).toBe(false);
  });
});
