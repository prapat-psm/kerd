const DAY_MS = 86_400_000;

/** วันที่ตอนเที่ยงคืนตามเวลาเครื่อง (ตัดเวลาออก) */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** จำนวนวันจาก a ถึง b (ปัดตามวันปฏิทิน ไม่สน DST) */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

export function addDays(d: Date, days: number): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** วันเกิดในปีที่กำหนด; 29 ก.พ. ในปีที่ไม่มีวันนั้นถือเป็น 28 ก.พ. */
export function birthdayInYear(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month, 0).getDate();
  return new Date(year, month - 1, Math.min(day, lastDay));
}
