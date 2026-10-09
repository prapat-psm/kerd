import { z } from "zod";

// วันสูงสุดของแต่ละเดือน (ก.พ. 29 เพราะไม่เก็บปีเกิด)
const MAX_DAY = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** ฟอร์ม "เตือนฉัน": PDPA เก็บแค่เดือน/วันเกิด ไม่รับปีเกิดหรือเบอร์โทร (key อื่นถูกตัดทิ้ง) */
export const ReminderInput = z
  .object({
    birthMonth: z.coerce.number().int().min(1).max(12),
    birthDay: z
      .union([z.literal(""), z.coerce.number().int().min(1).max(31)])
      .nullish()
      .transform((d) => (d === "" || d == null ? null : d)),
    marketingConsent: z
      .literal("on")
      .optional()
      .transform((v) => v === "on"),
  })
  .refine((v) => v.birthDay === null || v.birthDay <= MAX_DAY[v.birthMonth - 1], { path: ["birthDay"], message: "ไม่มีวันนี้ในเดือนที่เลือก" });

export type ReminderData = z.output<typeof ReminderInput>;
