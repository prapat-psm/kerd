// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandDirectory } from "./brand-directory";

afterEach(cleanup);

const brands = [
  { slug: "mk-restaurants", name: "MK", category: "food", promoCount: 1 },
  { slug: "kbank", name: "KBank", category: "bank", promoCount: 2 },
  { slug: "sizzler-th", name: "Sizzler", category: "food", promoCount: 1 },
];
const links = () => screen.getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")]);

describe("BrandDirectory", () => {
  it("ลิงก์ไปหน้าแบรนด์ทุกแบรนด์ พร้อมหมวดภาษาไทย", () => {
    render(<BrandDirectory brands={brands} />);
    expect(screen.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/brand/mk-restaurants",
      "/brand/kbank",
      "/brand/sizzler-th",
    ]);
    expect(screen.getByRole("link", { name: /KBank/ }).textContent).toContain("ธนาคาร/บัตร");
    expect(screen.getByRole("link", { name: /KBank/ }).textContent).toContain("2 โปร");
  });

  it("มีอักษรย่อของแบรนด์แทนโลโก้ โดยไม่เปลี่ยนชื่อลิงก์", () => {
    render(<BrandDirectory brands={brands} />);
    const link = screen.getByRole("link", { name: /Sizzler/ });
    expect(link.querySelector("[aria-hidden]")?.textContent).toBe("S");
  });

  it("กรองตามหมวดได้", () => {
    render(<BrandDirectory brands={brands} />);
    fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
    expect(links().map(([, href]) => href)).toEqual(["/brand/mk-restaurants", "/brand/sizzler-th"]);
  });
});
