// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandMark } from "./brand-mark";
import { CategoryChips } from "./category-chips";
import { Button } from "./ui/button";

// redesign P1-3 (เป้ากด ≥ 44px บนจอสัมผัส) + P1-4 (coral จุดเดียวต่อจอ)
afterEach(cleanup);

const options = [
  { value: "all", label: "ทั้งหมด", count: 3 },
  { value: "food", label: "อาหาร", count: 2 },
];

describe("เป้ากดบนจอสัมผัส", () => {
  it.each(["default", "sm"] as const)("ปุ่มขนาด %s สูงอย่างน้อย 44px เมื่อใช้นิ้ว", (size) => {
    render(<Button size={size}>ตกลง</Button>);
    expect(screen.getByRole("button").className).toContain("pointer-coarse:min-h-11");
  });

  it("ปุ่มไอคอนกว้าง/สูง 44px เมื่อใช้นิ้ว", () => {
    render(<Button size="icon" aria-label="ปิด" className="size-8" />);
    expect(screen.getByRole("button").className).toContain("pointer-coarse:size-11");
  });

  it("chip ตัวกรองสูงอย่างน้อย 44px เมื่อใช้นิ้ว", () => {
    render(<CategoryChips options={options} value="all" onChange={() => {}} />);
    for (const chip of screen.getAllByRole("button")) expect(chip.className).toContain("pointer-coarse:min-h-11");
  });
});

describe("coral จุดเดียวต่อจอ", () => {
  it("chip ที่เลือกใช้สี ink ไม่ใช่ coral", () => {
    render(<CategoryChips options={options} value="all" onChange={() => {}} />);
    const chip = screen.getByRole("button", { pressed: true });
    expect(chip.className).toContain("bg-foreground");
    expect(chip.className).not.toMatch(/\bbg-primary\b/);
  });

  it("วงอักษรย่อแบรนด์ใช้สีกลาง ไม่ใช่ coral", () => {
    const { container } = render(<BrandMark name="MK Restaurants" slug="no-logo-brand" />);
    const mark = container.querySelector("[data-slot=brand-mark]")!;
    expect(mark.className).not.toContain("primary");
    expect(mark.className).toContain("bg-muted");
  });
});
