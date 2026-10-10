import { describe, expect, it } from "vitest";
import { searchPromos } from "./search";

const item = (name: string, title: string, benefit: string, category: string) => ({ title, benefit, brand: { name, category } });
const promos = [
  item("Café Amazon", "เครื่องดื่มฟรีวันเกิด", "กาแฟฟรี 1 แก้ว", "drink"),
  item("MK Restaurants", "โปรเดือนเกิด", "ส่วนลด 10% ทั้งบิล", "food"),
  item("KBank", "บัตรเครดิตเดือนเกิด", "รับเครดิตเงินคืน", "bank"),
];
const names = (q: string) => searchPromos(promos, q).map((p) => p.brand.name);

describe("searchPromos", () => {
  it("คำค้นว่างหรือมีแต่ช่องว่าง แสดงทุกโปร", () => {
    expect(names("")).toHaveLength(3);
    expect(names("   ")).toHaveLength(3);
  });

  it("ค้นชื่อแบรนด์โดยไม่สนตัวพิมพ์เล็กใหญ่", () => {
    expect(names("mk")).toEqual(["MK Restaurants"]);
  });

  it("ค้นชื่อแบรนด์ได้โดยไม่ต้องพิมพ์วรรณยุกต์/accent ของภาษาอังกฤษ", () => {
    expect(names("cafe")).toEqual(["Café Amazon"]);
  });

  it("ค้นจากชื่อโปรและสิทธิ์ที่ได้ (ภาษาไทย)", () => {
    expect(names("กาแฟ")).toEqual(["Café Amazon"]);
    expect(names("ส่วนลด")).toEqual(["MK Restaurants"]);
  });

  it("ค้นจากชื่อหมวดภาษาไทย", () => {
    expect(names("ธนาคาร")).toEqual(["KBank"]);
  });

  it("หลายคำต้องเจอครบทุกคำ (ไม่จำเป็นต้องอยู่ช่องเดียวกัน)", () => {
    expect(names("mk ส่วนลด")).toEqual(["MK Restaurants"]);
    expect(names("mk กาแฟ")).toEqual([]);
  });
});
