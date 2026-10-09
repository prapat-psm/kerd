import { addDays } from "@/lib/dates";

/** PDPA: รายละเอียด/สาขาที่ผู้ใช้พิมพ์ลบทิ้งเมื่อเก่ากว่านี้ (เหลือแค่เหตุผลและวันที่ไว้ดูสถิติ) */
export const NOTE_RETENTION_DAYS = 180;

export function noteRetentionCutoff(now: Date): Date {
  return addDays(now, -NOTE_RETENTION_DAYS);
}
