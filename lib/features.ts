import { lineLoginEnabled } from "@/lib/account/auth-config";

/** พักฟีเจอร์ LINE Login + เตือนฉันไว้ก่อน: ซ่อนปุ่มและหน้า /remind แต่เก็บโค้ดไว้ เปิดใหม่ด้วยการเปลี่ยนเป็น true */
export const LINE_REMINDERS_ENABLED = false;

export function lineRemindersOn(env: Record<string, string | undefined>, enabled: boolean = LINE_REMINDERS_ENABLED): boolean {
  return enabled && lineLoginEnabled(env);
}
