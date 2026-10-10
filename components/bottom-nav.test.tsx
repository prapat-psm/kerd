// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
const { BottomNav } = await import("./bottom-nav");

afterEach(cleanup);

const nav = () => screen.getByRole("navigation", { name: "เมนูหลัก" });

// P2-1 แถบล่างบนมือถือ: โปรวันเกิด / แบรนด์ / แจ้งโปร
describe("BottomNav", () => {
  it("มี 3 ลิงก์ไปหน้าหลัก", () => {
    render(<BottomNav />);
    const links = within(nav()).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["โปรวันเกิด", "/"],
      ["แบรนด์", "/brand"],
      ["แจ้งโปร", "/submit"],
    ]);
  });

  it.each([
    ["/", "โปรวันเกิด"],
    ["/brand", "แบรนด์"],
    ["/brand/mk", "แบรนด์"],
    ["/submit", "แจ้งโปร"],
  ])("อยู่หน้า %s แท็บ %s เป็นหน้าปัจจุบัน", (path, label) => {
    pathname = path;
    render(<BottomNav />);
    const current = within(nav()).getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page");
    expect(current.map((a) => a.textContent)).toEqual([label]);
  });

  it("หน้าอื่นไม่มีแท็บไหนเป็นหน้าปัจจุบัน", () => {
    pathname = "/privacy";
    render(<BottomNav />);
    expect(within(nav()).getAllByRole("link").some((a) => a.hasAttribute("aria-current"))).toBe(false);
  });

  it("แสดงเฉพาะจอเล็ก และเผื่อพื้นที่ safe area ด้านล่าง", () => {
    render(<BottomNav />);
    expect(nav().className).toContain("md:hidden");
    expect(nav().className).toContain("pb-[env(safe-area-inset-bottom)]");
  });

  it("ซ่อนแถบเมื่อคีย์บอร์ดเปิด (มีช่องกรอกที่โฟกัสบนจอสัมผัส)", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toMatch(/@media \(pointer: coarse\)[\s\S]*body:has\(:is\(input:not\(\[type="radio"\], \[type="checkbox"\]\), textarea\):focus\) \[data-bottom-nav\]/);
  });

  it("เลื่อนหาช่องหรือปุ่มแล้วไม่จมใต้แถบล่าง", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toMatch(/@media \(width < 48rem\)[\s\S]*scroll-padding-bottom: calc\(5rem \+ env\(safe-area-inset-bottom\)\)/);
  });
});

describe("SiteHeader บนจอ md+", () => {
  it("ลิงก์ข้อความใน header ซ่อนบนมือถือ (ใช้แถบล่างแทน)", () => {
    render(<SiteHeader />);
    const links = within(screen.getByRole("navigation", { name: "เมนูหลัก (จอใหญ่)" })).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/brand", "/submit"]);
    expect(screen.getByRole("navigation", { name: "เมนูหลัก (จอใหญ่)" }).className).toContain("max-md:hidden");
  });
});

describe("viewport", () => {
  it("ขยายถึงขอบจอ เพื่อให้ใช้ safe-area-inset ได้", async () => {
    vi.doMock("next/font/google", () => ({ IBM_Plex_Sans_Thai: () => ({ variable: "" }) }));
    const { viewport } = await import("@/app/layout");
    expect(viewport.viewportFit).toBe("cover");
  });
});
