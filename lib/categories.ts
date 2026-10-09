// หมวดของแบรนด์ (Brand.category) และตัวกรองบนหน้าเดือน/หน้ารวมแบรนด์
const LABELS: Record<string, string> = {
  food: "อาหาร",
  drink: "เครื่องดื่ม",
  bank: "ธนาคาร/บัตร",
  retail: "ช้อปปิ้ง",
  beauty: "ความงาม",
  entertainment: "บันเทิง",
  app: "แอป",
};

export const ALL = "all";

export type CategoryOption = { value: string; label: string; count: number };

type HasCategory = { brand: { category: string } };
type GetCategory<T> = (item: T) => string;
const byBrand = (i: HasCategory) => i.brand.category;

export function categoryLabel(category: string): string {
  return LABELS[category] ?? category;
}

/** ตัวเลือก "ทั้งหมด" ตามด้วยหมวดที่มีจริง เรียงจากจำนวนมากไปน้อย */
export function categoryOptions<T>(items: T[], get: GetCategory<T> = byBrand as GetCategory<T>): CategoryOption[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(get(item), (counts.get(get(item)) ?? 0) + 1);
  const options = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: categoryLabel(value), count }));
  return [{ value: ALL, label: "ทั้งหมด", count: items.length }, ...options];
}

export function filterByCategory<T>(items: T[], category: string, get: GetCategory<T> = byBrand as GetCategory<T>): T[] {
  return category === ALL ? items : items.filter((i) => get(i) === category);
}
