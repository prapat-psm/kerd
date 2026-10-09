import { describe, expect, it } from "vitest";
import { CONSENT_PURPOSE, CONSENT_VERSION, consentEntry } from "./consent";

describe("consentEntry", () => {
  it("purpose แยกสำหรับข้อความการตลาดทาง LINE พร้อมเวอร์ชันของข้อความขอความยินยอม", () => {
    expect(CONSENT_PURPOSE).toBe("marketing_line");
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("บันทึกเมื่อให้ครั้งแรก", () => {
    expect(consentEntry(null, true)).toEqual({ purpose: "marketing_line", granted: true, version: CONSENT_VERSION });
  });

  it("ไม่เคยให้และยังไม่ให้: ไม่ต้องบันทึก", () => {
    expect(consentEntry(null, false)).toBeNull();
  });

  it("บันทึกเมื่อถอน", () => {
    expect(consentEntry(true, false)).toEqual({ purpose: "marketing_line", granted: false, version: CONSENT_VERSION });
  });

  it("ไม่เปลี่ยน: ไม่บันทึกซ้ำ", () => {
    expect(consentEntry(true, true)).toBeNull();
    expect(consentEntry(false, false)).toBeNull();
  });

  it("เคยถอนแล้วให้ใหม่: บันทึก", () => {
    expect(consentEntry(false, true)?.granted).toBe(true);
  });
});
