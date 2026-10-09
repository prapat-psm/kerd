import { describe, expect, it } from "vitest";
import { ReminderInput } from "./schema";

describe("ReminderInput", () => {
  it("รับเดือนจาก form และไม่บังคับวัน", () => {
    expect(ReminderInput.parse({ birthMonth: "10" })).toEqual({ birthMonth: 10, birthDay: null, marketingConsent: false });
  });

  it("checkbox ยินยอมส่งมาเป็น 'on'", () => {
    expect(ReminderInput.parse({ birthMonth: "2", birthDay: "29", marketingConsent: "on" })).toEqual({
      birthMonth: 2,
      birthDay: 29,
      marketingConsent: true,
    });
  });

  it("วันว่างเป็น null", () => {
    expect(ReminderInput.parse({ birthMonth: "1", birthDay: "" }).birthDay).toBeNull();
  });

  it.each([
    [{ birthMonth: "0" }],
    [{ birthMonth: "13" }],
    [{ birthMonth: "2", birthDay: "30" }],
    [{ birthMonth: "4", birthDay: "31" }],
    [{ birthMonth: "1", birthDay: "0" }],
    [{ birthMonth: "x" }],
  ])("ปฏิเสธวันที่ไม่มีจริง %j", (raw) => {
    expect(ReminderInput.safeParse(raw).success).toBe(false);
  });

  it("ไม่รับปีเกิดหรือข้อมูลอื่น (PDPA: เก็บขั้นต่ำ)", () => {
    expect(ReminderInput.parse({ birthMonth: "5", birthYear: "1990", phone: "0812345678" })).toEqual({
      birthMonth: 5,
      birthDay: null,
      marketingConsent: false,
    });
  });
});
