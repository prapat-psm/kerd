import { describe, expect, it } from "vitest";
import { nextReminderDates } from "./reminders";

describe("nextReminderDates", () => {
  it("เตือนสมัครสมาชิก 30 วันก่อนวันที่ 1 ของเดือนเกิด และสรุปโปรวันที่ 1", () => {
    const r = nextReminderDates({ month: 12 }, new Date(2026, 9, 8));
    expect(r.monthSummary).toEqual(new Date(2026, 11, 1));
    expect(r.signupReminder).toEqual(new Date(2026, 10, 1));
  });

  it("ถ้าเลยวันที่ 1 ของเดือนเกิดปีนี้แล้ว ใช้ปีถัดไป", () => {
    const r = nextReminderDates({ month: 10 }, new Date(2026, 9, 8));
    expect(r.monthSummary).toEqual(new Date(2027, 9, 1));
    expect(r.signupReminder).toEqual(new Date(2027, 8, 1));
  });

  it("วันนี้คือวันที่ 1 ของเดือนเกิด ยังนับเป็นรอบปีนี้", () => {
    const r = nextReminderDates({ month: 10 }, new Date(2026, 9, 1));
    expect(r.monthSummary).toEqual(new Date(2026, 9, 1));
  });

  it("เดือนเกิดมกราคม การเตือนสมัครตกปีก่อนหน้า", () => {
    const r = nextReminderDates({ month: 1 }, new Date(2026, 9, 8));
    expect(r.monthSummary).toEqual(new Date(2027, 0, 1));
    expect(r.signupReminder).toEqual(new Date(2026, 11, 2));
  });
});
