import { addDays, startOfDay } from "./dates";

export const SIGNUP_LEAD_DAYS = 30;

export type ReminderDates = { signupReminder: Date; monthSummary: Date };

/** รอบแจ้งเตือนถัดไป: สรุปโปรวันที่ 1 ของเดือนเกิด และเตือนสมัครสมาชิกล่วงหน้า 30 วัน */
export function nextReminderDates(birth: { month: number }, today = new Date()): ReminderDates {
  const day = startOfDay(today);
  let monthSummary = new Date(day.getFullYear(), birth.month - 1, 1);
  if (monthSummary < day) monthSummary = new Date(day.getFullYear() + 1, birth.month - 1, 1);
  return { monthSummary, signupReminder: addDays(monthSummary, -SIGNUP_LEAD_DAYS) };
}
