// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandMark } from "./brand-mark";

afterEach(cleanup);

describe("BrandMark", () => {
  it("แสดงอักษรย่อของแบรนด์แทนโลโก้", () => {
    const { container } = render(<BrandMark name="Pizza Hut Thailand" />);
    expect(container.textContent).toBe("PH");
  });

  it("เป็นภาพตกแต่ง ซ่อนจาก screen reader (ชื่อแบรนด์อยู่ในข้อความข้างๆ)", () => {
    const { container } = render(<BrandMark name="Watsons" />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("ไม่ใช้รูปภาพ (ไม่มี img) เพราะห้ามใช้โลโก้แบรนด์อื่นโดยไม่ได้รับอนุญาต", () => {
    const { container } = render(<BrandMark name="Watsons" />);
    expect(container.querySelector("img")).toBeNull();
  });
});
