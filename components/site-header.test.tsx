// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HomeIntro } from "./home-intro";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

afterEach(cleanup);

// P2-2 header เบาลง: เหลือโลโก้กับลิงก์ ปุ่มธีมย้ายไปท้ายเว็บ
describe("SiteHeader", () => {
  it("มีโลโก้กลับหน้าแรกและลิงก์แบรนด์ ไม่มีปุ่มธีม", () => {
    render(<SiteHeader />);
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Kerd เกิด หน้าแรก" }).getAttribute("href")).toBe("/");
    expect(within(header).getByRole("link", { name: "แบรนด์" }).getAttribute("href")).toBe("/brand");
    expect(within(header).queryByRole("group", { name: "ธีมสี" })).toBeNull();
  });

  it("โลโก้ไหวเหมือนเปลวเทียนเมื่อ hover เฉพาะผู้ที่ไม่ได้ปิด motion", () => {
    const { container } = render(<SiteHeader />);
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("motion-safe:group-hover:animate-flicker");
  });

  it("keyframe flicker หมุนไปมาแล้วกลับที่เดิม", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toMatch(/--animate-flicker:\s*flicker 600ms/);
    expect(css).toMatch(/@keyframes flicker/);
  });
});

describe("SiteFooter", () => {
  it("มีปุ่มเลือกธีมสี", () => {
    render(<SiteFooter />);
    expect(within(screen.getByRole("contentinfo")).getByRole("group", { name: "ธีมสี" })).toBeTruthy();
  });
});

// P2-3 หน้าแรกกระชับ: หัวข้อตรง branding ไม่มีย่อหน้าอธิบายตัวกรอง
describe("HomeIntro", () => {
  it("หัวข้อ 'เดือนเกิดนี้ ได้อะไรบ้าง?' ขนาดยืดตามจอ", () => {
    render(<HomeIntro />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("เดือนเกิดนี้ ได้อะไรบ้าง?");
    expect(h1.className).toContain("text-[clamp(1.75rem,6vw,2.25rem)]");
  });

  it("ไม่มีย่อหน้าอธิบายตัวกรอง", () => {
    const { container } = render(<HomeIntro />);
    expect(container.textContent).not.toMatch(/กรองตามหมวด/);
  });
});
