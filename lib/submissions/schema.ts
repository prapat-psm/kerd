import { z } from "zod";

// กติกาข้อมูล: ใช้หน้าเว็บทางการเท่านั้น โซเชียลเป็นแค่ลีด จึงไม่รับเป็นแหล่งที่มา
const SOCIAL_HOSTS = ["facebook.com", "fb.com", "instagram.com", "tiktok.com", "line.me", "lin.ee", "lemon8-app.com", "x.com", "twitter.com"];

function isSocial(url: string): boolean {
  // Zod 4 รัน refine ต่อแม้ z.url ไม่ผ่าน จึงต้องกัน URL ที่ parse ไม่ได้
  if (!URL.canParse(url)) return false;
  const host = new URL(url).hostname;
  return SOCIAL_HOSTS.some((s) => host === s || host.endsWith(`.${s}`));
}

const text = (max: number) => z.string().trim().min(1).max(max);

/** ฟอร์มแจ้งโปร: ไม่รับชื่อหรือช่องทางติดต่อของผู้แจ้ง (key อื่นถูกตัดทิ้ง) */
export const SubmissionInput = z.object({
  brandName: text(80),
  sourceUrl: z
    .url({ protocol: /^https$/ })
    .max(500)
    .refine((u) => !isSocial(u), "ใส่ลิงก์หน้าเว็บทางการของแบรนด์ ไม่ใช่โซเชียลมีเดีย"),
  benefit: text(300),
  howToRedeem: z
    .string()
    .trim()
    .max(300)
    .nullish()
    .transform((s) => s || null),
  /** ช่องดักบอท */
  website: z.string().default(""),
});

export type SubmissionData = z.output<typeof SubmissionInput>;
