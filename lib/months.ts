export type MonthInfo = { month: number; slug: string; th: string };

export const MONTHS: MonthInfo[] = [
  ["january", "มกราคม"],
  ["february", "กุมภาพันธ์"],
  ["march", "มีนาคม"],
  ["april", "เมษายน"],
  ["may", "พฤษภาคม"],
  ["june", "มิถุนายน"],
  ["july", "กรกฎาคม"],
  ["august", "สิงหาคม"],
  ["september", "กันยายน"],
  ["october", "ตุลาคม"],
  ["november", "พฤศจิกายน"],
  ["december", "ธันวาคม"],
].map(([slug, th], i) => ({ month: i + 1, slug, th }));

export function monthFromSlug(slug: string): number | null {
  return MONTHS.find((m) => m.slug === slug)?.month ?? null;
}

/** เดือนเกิดครั้งถัดไป (รวมเดือนนี้) ตั้งแต่วันที่ 1 ถึงวันสุดท้ายของเดือน */
export function nextOccurrence(month: number, today: Date): { start: Date; end: Date } {
  const year = month >= today.getMonth() + 1 ? today.getFullYear() : today.getFullYear() + 1;
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
}
