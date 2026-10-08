import type { CSSProperties } from "react";

/** หน่วงได้สูงสุดกี่ชิ้น ชิ้นถัดไปขึ้นพร้อมชิ้นสุดท้าย */
export const MAX_STAGGER = 6;

/** ใช้กับ class "animate-fade-up stagger" เพื่อให้รายการค่อยๆ ขึ้นทีละชิ้น */
export function stagger(index: number): CSSProperties {
  return { "--i": Math.min(index, MAX_STAGGER) } as CSSProperties;
}
