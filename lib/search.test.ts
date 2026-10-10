import { describe, expect, it } from "vitest";
import { brandSuggestions, searchPromos } from "./search";

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

describe("brandSuggestions", () => {
  const withSlug = (name: string, slug: string, title: string, category = "food") => ({ title, benefit: "", brand: { name, slug, category } });
  const items = [
    withSlug("MK Restaurants", "mk", "โปรเดือนเกิด"),
    withSlug("MK Restaurants", "mk", "โปรสมาชิก"),
    withSlug("Café Amazon", "cafe-amazon", "กาแฟฟรี", "drink"),
    withSlug("Amazon Kindle", "kindle", "ส่วนลดอีบุ๊ก", "app"),
    withSlug("Sizzler", "sizzler", "สลัดบาร์"),
  ];
  const slugs = (q: string, limit?: number) => brandSuggestions(items, q, limit).map((b) => b.slug);

  it("คำค้นว่างไม่แนะนำอะไร", () => {
    expect(slugs("  ")).toEqual([]);
  });

  it("แนะนำแบรนด์ไม่ซ้ำ พร้อมจำนวนโปรของแบรนด์", () => {
    expect(brandSuggestions(items, "mk")).toEqual([{ name: "MK Restaurants", slug: "mk", category: "food", count: 2 }]);
  });

  it("จับคู่จากชื่อแบรนด์เท่านั้น ไม่สนตัวพิมพ์และ accent", () => {
    expect(slugs("CAFE")).toEqual(["cafe-amazon"]);
    expect(slugs("กาแฟ")).toEqual([]);
  });

  it("แบรนด์ที่ขึ้นต้นด้วยคำค้นมาก่อน แล้วเรียงตามชื่อ", () => {
    expect(slugs("amazon")).toEqual(["kindle", "cafe-amazon"]);
  });

  it("จำกัดจำนวนคำแนะนำ", () => {
    expect(slugs("a", 2)).toHaveLength(2);
  });
});
