import { describe, expect, it } from "vitest";
import { categoryLabel, categoryOptions, filterByCategory } from "./categories";

const items = [
  { id: "1", brand: { category: "food" } },
  { id: "2", brand: { category: "bank" } },
  { id: "3", brand: { category: "food" } },
  { id: "4", brand: { category: "beauty" } },
];

describe("categoryLabel", () => {
  it("แปลงหมวดเป็นภาษาไทย", () => {
    expect(categoryLabel("food")).toBe("อาหาร");
    expect(categoryLabel("bank")).toBe("ธนาคาร/บัตร");
  });

  it("หมวดที่ไม่รู้จักแสดงชื่อเดิม", () => {
    expect(categoryLabel("pets")).toBe("pets");
  });
});

describe("categoryOptions", () => {
  it("เริ่มด้วย 'ทั้งหมด' แล้วเรียงหมวดตามจำนวนมากไปน้อย พร้อมจำนวน", () => {
    expect(categoryOptions(items)).toEqual([
      { value: "all", label: "ทั้งหมด", count: 4 },
      { value: "food", label: "อาหาร", count: 2 },
      { value: "bank", label: "ธนาคาร/บัตร", count: 1 },
      { value: "beauty", label: "ความงาม", count: 1 },
    ]);
  });

  it("ไม่มีรายการ ได้แค่ 'ทั้งหมด'", () => {
    expect(categoryOptions([])).toEqual([{ value: "all", label: "ทั้งหมด", count: 0 }]);
  });
});

describe("filterByCategory", () => {
  it("'all' คืนทุกรายการ", () => {
    expect(filterByCategory(items, "all")).toHaveLength(4);
  });

  it("กรองเฉพาะหมวดที่เลือก", () => {
    expect(filterByCategory(items, "food").map((i) => i.id)).toEqual(["1", "3"]);
  });
});

describe("ใช้กับข้อมูลรูปแบบอื่นได้ด้วยตัวดึงหมวด", () => {
  const brands = [{ category: "food" }, { category: "bank" }, { category: "food" }];
  const get = (b: { category: string }) => b.category;

  it("นับหมวดและกรองได้", () => {
    expect(categoryOptions(brands, get).map((o) => o.count)).toEqual([3, 2, 1]);
    expect(filterByCategory(brands, "bank", get)).toEqual([{ category: "bank" }]);
  });
});
