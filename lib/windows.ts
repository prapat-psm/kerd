import { ALL, type CategoryOption } from "@/lib/categories";

// ช่วงที่ใช้สิทธิ์ได้ (Promotion.window) สำหรับตัวกรองบนหน้าแรก เรียงจากช่วงสั้นไปยาว
const WINDOWS = [
  { value: "day", label: "วันเกิด" },
  { value: "week", label: "สัปดาห์วันเกิด" },
  { value: "month", label: "ทั้งเดือนเกิด" },
] as const;

type HasWindow = { window: string };

/** ตัวเลือก "ทั้งหมด" ตามด้วยช่วงที่มีโปรจริง */
export function windowOptions(items: HasWindow[]): CategoryOption[] {
  const options = WINDOWS.map((w) => ({ ...w, count: items.filter((i) => i.window === w.value).length })).filter((o) => o.count > 0);
  return [{ value: ALL, label: "ทั้งหมด", count: items.length }, ...options];
}

export function filterByWindow<T extends HasWindow>(items: T[], window: string): T[] {
  return window === ALL ? items : items.filter((i) => i.window === window);
}

const SHORT_LABELS: Record<(typeof WINDOWS)[number]["value"], string> = { day: "วันเกิด", week: "สัปดาห์", month: "ทั้งเดือน" };

/** ช่องของ segmented control: ครบทุกช่วงเสมอ (ตำแหน่งไม่กระโดด) ช่วงที่ไม่มีโปรกดไม่ได้ */
export function windowSegments(items: HasWindow[]) {
  return [
    { value: ALL, label: "ทั้งหมด", count: items.length, disabled: items.length === 0 },
    ...WINDOWS.map((w) => {
      const count = items.filter((i) => i.window === w.value).length;
      return { value: w.value as string, label: SHORT_LABELS[w.value], count, disabled: count === 0 };
    }),
  ];
}
