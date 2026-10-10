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
