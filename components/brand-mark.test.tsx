// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandMark } from "./brand-mark";

vi.mock("@/lib/brand-logos", () => ({
  brandLogo: (slug: string) => (slug === "allowed-brand" ? { src: "/brand-logos/allowed-brand.svg", permission: "อีเมลอนุญาต" } : null),
}));

afterEach(cleanup);

describe("BrandMark", () => {
  it("แสดงอักษรย่อของแบรนด์แทนโลโก้", () => {
    const { container } = render(<BrandMark name="Pizza Hut Thailand" slug="pizza-hut-th" />);
    expect(container.textContent).toBe("PH");
  });

  it("เป็นภาพตกแต่ง ซ่อนจาก screen reader (ชื่อแบรนด์อยู่ในข้อความข้างๆ)", () => {
    const { container } = render(<BrandMark name="Watsons" slug="watsons-th" />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("ไม่ใช้รูปของแบรนด์ที่ยังไม่อนุญาต", () => {
    const { container } = render(<BrandMark name="Watsons" slug="watsons-th" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("ใช้โลโก้จริงเมื่อแบรนด์อนุญาตแล้ว", () => {
    const { container } = render(<BrandMark name="Allowed" slug="allowed-brand" />);
    expect(container.querySelector("img")?.getAttribute("src")).toContain("allowed-brand.svg");
    expect(container.textContent).toBe("");
  });
});
