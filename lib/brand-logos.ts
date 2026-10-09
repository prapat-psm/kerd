// โลโก้จริงใช้ได้เฉพาะแบรนด์ที่อนุญาตเป็นลายลักษณ์อักษรแล้ว (docs/branding.md) ที่เหลือแสดงอักษรย่อ
// เพิ่มแบรนด์: วางไฟล์ที่ public/brand-logos/<slug>.svg แล้วใส่ที่นี่ พร้อมหลักฐาน เช่น "อีเมลจาก ... วันที่ ..."
export type BrandLogo = { src: string; permission: string };

export const BRAND_LOGOS: Record<string, BrandLogo> = {};

export function brandLogo(slug: string): BrandLogo | null {
  return BRAND_LOGOS[slug] ?? null;
}
