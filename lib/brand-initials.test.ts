import { describe, expect, it } from "vitest";
import { brandInitials } from "./brand-initials";

// อักษรย่อที่เราวาดเองแทนโลโก้ (branding.md ห้ามใช้โลโก้แบรนด์อื่นโดยไม่ได้รับอนุญาต)
describe("brandInitials", () => {
  it.each([
    ["Pizza Hut Thailand", "PH"],
    ["Café Amazon", "CA"],
    ["Bar B Q Plaza", "BB"],
    ["The Pizza Company", "PC"],
    ["True Privilege / TrueYou", "TP"],
  ])("หลายคำใช้ตัวแรกของ 2 คำแรก ไม่นับคำทั่วไปอย่าง The/Thailand: %s → %s", (name, expected) => {
    expect(brandInitials(name)).toBe(expected);
  });

  it.each([
    ["Watsons", "W"],
    ["McDonald's Thailand", "M"],
    ["uniqlo", "U"],
    ["ONESIAM", "O"],
  ])("คำเดียวใช้ตัวแรก ตัวพิมพ์ใหญ่: %s → %s", (name, expected) => {
    expect(brandInitials(name)).toBe(expected);
  });

  it.each([
    ["S&P", "S&P"],
    ["MK Restaurants", "MK"],
    ["ttb bank", "TTB"],
  ])("คำสั้นไม่เกิน 3 ตัวใช้ทั้งคำ: %s → %s", (name, expected) => {
    expect(brandInitials(name)).toBe(expected);
  });

  it("ใช้ตัวย่อภาษาอังกฤษในวงเล็บถ้ามี", () => {
    expect(brandInitials("บัตรเครดิตออมสิน (GSB)")).toBe("GSB");
  });

  it("ไม่นับคำในวงเล็บที่ไม่ใช่ตัวย่อ", () => {
    expect(brandInitials("Krungsri (บัตรเครดิตกรุงศรี)")).toBe("K");
  });

  it("ชื่อไทยข้ามสระหน้า (เ แ โ ใ ไ) ไปใช้พยัญชนะ", () => {
    expect(brandInitials("เซ็นทรัล")).toBe("ซ");
    expect(brandInitials("ออมสิน")).toBe("อ");
  });

  it("ชื่อว่างคืน ?", () => {
    expect(brandInitials("  ")).toBe("?");
  });
});
