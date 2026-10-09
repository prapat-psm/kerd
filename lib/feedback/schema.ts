import { z } from "zod";

export const FEEDBACK_REASONS = ["wrong_info", "store_refused", "expired", "other"] as const;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

const LABELS: Record<FeedbackReason, string> = {
  wrong_info: "ข้อมูลผิด",
  store_refused: "หน้าร้านไม่ให้ใช้สิทธิ์",
  expired: "โปรหมดแล้ว",
  other: "อื่นๆ",
};

export function reasonLabel(reason: FeedbackReason): string {
  return LABELS[reason];
}

/** ข้อความว่างหรือมีแต่ช่องว่าง = null */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((s) => s || null);

// มาจาก FormData ทุกช่องเป็น string; PDPA: ไม่รับชื่อ/ติดต่อกลับ ไม่เก็บ IP
export const FeedbackInput = z
  .object({
    promotionId: z.uuid(),
    stillValid: z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]),
    reason: z.enum(FEEDBACK_REASONS).nullish().transform((r) => r ?? null),
    note: optionalText(300),
    branch: optionalText(80),
    /** ช่องดักบอท ซ่อนจากคน ถ้ามีค่าแปลว่าเป็นบอท */
    website: z.string().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.stillValid) return;
    if (!v.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "เลือกเหตุผล" });
    else if (v.reason === "other" && !v.note) ctx.addIssue({ code: "custom", path: ["note"], message: "อธิบายสั้นๆ ว่าเกิดอะไรขึ้น" });
  })
  // 👍 ไม่ต้องมีเหตุผล: ทิ้งช่องอื่นเพื่อเก็บข้อมูลให้น้อยที่สุด
  .transform((v) => (v.stillValid ? { ...v, reason: null, note: null, branch: null } : v));

export type FeedbackData = z.output<typeof FeedbackInput>;
