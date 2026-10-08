import { birthdayInYear, daysBetween } from "./dates";

export type PromoWindow = {
  window: "day" | "week" | "month";
  windowDaysBefore: number;
  windowDaysAfter: number;
};

export type Birth = { month: number; day?: number };

const WEEK_SPAN = 3;

export function isEligible(promo: PromoWindow, birth: Birth, today = new Date()): boolean {
  if (promo.window === "month") return today.getMonth() + 1 === birth.month;
  if (!birth.day) return false;

  const [before, after] =
    promo.window === "week" ? [WEEK_SPAN, WEEK_SPAN] : [promo.windowDaysBefore, promo.windowDaysAfter];
  const year = today.getFullYear();

  // ตรวจวันเกิดของปีก่อน ปีนี้ และปีหน้า เพื่อรองรับช่วงที่คร่อมปีใหม่
  return [year - 1, year, year + 1].some((y) => {
    const diff = daysBetween(birthdayInYear(y, birth.month, birth.day!), today);
    return diff >= -before && diff <= after;
  });
}
