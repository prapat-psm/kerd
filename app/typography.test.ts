// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

// อักษรไทยมีสระ/วรรณยุกต์ซ้อนบนล่าง ระยะบรรทัดต่ำกว่า ~1.6 เสี่ยงถูกตัด (docs/branding.md)
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const lineHeight = (size: string) => Number(css.match(new RegExp(`--text-${size}--line-height:\\s*([\\d.]+)`))?.[1]);

describe("typography สำหรับภาษาไทย", () => {
  it.each(["xs", "sm", "base"])("text-%s มีระยะบรรทัดอย่างน้อย 1.6", (size) => {
    expect(lineHeight(size)).toBeGreaterThanOrEqual(1.6);
  });

  it("หัวข้อการ์ดไม่ใช้ leading-none ที่ตัดวรรณยุกต์", () => {
    const { container } = render(createElement(CardTitle, null, "ชื่อแบรนด์"));
    expect(container.firstElementChild!.className).not.toContain("leading-none");
  });
});

describe("motion ของปุ่ม", () => {
  it("ไม่ใช้ transition-all (animate เฉพาะสี เงา และ scale)", () => {
    const { container } = render(createElement(Button, null, "ตกลง"));
    const className = container.firstElementChild!.className;
    expect(className).not.toContain("transition-all");
    expect(className).toMatch(/transition-\[[^\]]*scale[^\]]*\]/);
  });
});
