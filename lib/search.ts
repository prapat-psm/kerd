import { categoryLabel } from "@/lib/categories";

// ค้นโปรบนหน้าแรก (ฝั่ง client) จากชื่อแบรนด์ ชื่อโปร สิทธิ์ที่ได้ และชื่อหมวด
type Searchable = { title: string; benefit: string; brand: { name: string; category: string } };

/** ตัวพิมพ์เล็ก และตัด accent ภาษาอังกฤษ (Café → cafe) โดยไม่แตะวรรณยุกต์ไทย */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** ทุกคำในคำค้นต้องเจอ (คำละช่องก็ได้) คำค้นว่างคืนทุกรายการ */
export function searchPromos<T extends Searchable>(items: T[], query: string): T[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return items;
  return items.filter((i) => {
    const haystack = normalize([i.brand.name, i.title, i.benefit, categoryLabel(i.brand.category)].join(" "));
    return words.every((w) => haystack.includes(w));
  });
}
