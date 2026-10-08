import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_STAGGER, stagger } from "./motion";

describe("stagger", () => {
  it("ส่งลำดับเป็น CSS variable --i ให้ animation หน่วงทีละชิ้น", () => {
    expect(stagger(0)).toEqual({ "--i": 0 });
    expect(stagger(2)).toEqual({ "--i": 2 });
  });

  it("หยุดหน่วงหลังชิ้นที่ MAX_STAGGER เพื่อไม่ให้รายการยาวรอนาน", () => {
    expect(stagger(50)).toEqual({ "--i": MAX_STAGGER });
  });
});

describe("globals.css motion", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  it("มี keyframes fade-up และ utility animate-fade-up", () => {
    expect(css).toMatch(/@keyframes fade-up/);
    expect(css).toMatch(/--animate-fade-up:/);
  });

  it("ปิด animation และ transition เมื่อผู้ใช้ตั้ง reduced motion", () => {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block.length).toBeLessThan(css.length);
    expect(block).toMatch(/animation-duration:\s*0\.01ms !important/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms !important/);
  });
});
