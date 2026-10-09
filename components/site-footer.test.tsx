// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

afterEach(cleanup);

describe("SiteFooter", () => {
  it("มีลิงก์แบรนด์ทั้งหมด นโยบายความเป็นส่วนตัว และข้อกำหนด", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation", { name: "ลิงก์ท้ายเว็บ" });
    const hrefs = [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/brand", "/privacy", "/terms"]);
  });

  it("ยังคงคำเตือนให้ตรวจสิทธิ์ที่ต้นทาง", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/ตรวจสิทธิ์ที่ต้นทาง/)).toBeTruthy();
  });
});
