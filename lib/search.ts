import { categoryLabel } from "@/lib/categories";

// ค้นโปรบนหน้าแรก (ฝั่ง client) จากชื่อแบรนด์ ชื่อโปร สิทธิ์ที่ได้ และชื่อหมวด
type Searchable = { title: string; benefit: string; brand: { name: string; category: string } };

/** ตัวพิมพ์เล็ก และตัด accent ภาษาอังกฤษ (Café → cafe) โดยไม่แตะวรรณยุกต์ไทย */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function words(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/** ทุกคำในคำค้นต้องเจอ (คำละช่องก็ได้) คำค้นว่างคืนทุกรายการ */
export function searchPromos<T extends Searchable>(items: T[], query: string): T[] {
  const terms = words(query);
  if (terms.length === 0) return items;
  return items.filter((i) => {
    const haystack = normalize([i.brand.name, i.title, i.benefit, categoryLabel(i.brand.category)].join(" "));
    return terms.every((w) => haystack.includes(w));
  });
}

export type BrandSuggestion = { name: string; slug: string; category: string; count: number };
type HasBrand = { brand: { name: string; slug: string; category: string } };

/** แบรนด์ที่ชื่อตรงกับคำค้น (ไม่ซ้ำ พร้อมจำนวนโปร) ชื่อที่ขึ้นต้นด้วยคำค้นมาก่อน แล้วเรียงตามชื่อ */
export function brandSuggestions(items: HasBrand[], query: string, limit = 5): BrandSuggestion[] {
  const terms = words(query);
  if (terms.length === 0) return [];
  const brands = new Map<string, BrandSuggestion>();
  for (const { brand } of items) {
    const name = normalize(brand.name);
    if (!terms.every((w) => name.includes(w))) continue;
    const found = brands.get(brand.slug);
    brands.set(brand.slug, found ? { ...found, count: found.count + 1 } : { ...brand, count: 1 });
  }
  const startsWith = (b: BrandSuggestion) => (normalize(b.name).startsWith(terms[0]) ? 0 : 1);
  return [...brands.values()].sort((a, b) => startsWith(a) - startsWith(b) || a.name.localeCompare(b.name)).slice(0, limit);
}
