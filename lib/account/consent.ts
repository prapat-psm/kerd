/** ความยินยอมรับข้อความการตลาดทาง LINE แยกจากการเข้าสู่ระบบ (PDPA ม.19) */
export const CONSENT_PURPOSE = "marketing_line";
/** เปลี่ยนเมื่อแก้ข้อความขอความยินยอมในหน้า /remind */
export const CONSENT_VERSION = "2026-10-09";

export type ConsentEntry = { purpose: string; granted: boolean; version: string };

/** บันทึกเฉพาะเมื่อสถานะเปลี่ยน (null = ไม่เคยมีบันทึก) */
export function consentEntry(previous: boolean | null, granted: boolean): ConsentEntry | null {
  if (previous === granted || (previous === null && !granted)) return null;
  return { purpose: CONSENT_PURPOSE, granted, version: CONSENT_VERSION };
}
