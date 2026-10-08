// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PromoListSkeleton } from "./promo-card-skeleton";

afterEach(cleanup);

describe("PromoListSkeleton", () => {
  it("บอก screen reader ว่ากำลังโหลด", () => {
    render(<PromoListSkeleton />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.textContent).toContain("กำลังโหลดโปร");
  });

  it("แสดงการ์ดโครงร่างตามจำนวนที่กำหนด โดยค่าเริ่มต้นคือ 3", () => {
    const { container, rerender } = render(<PromoListSkeleton />);
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(3);
    rerender(<PromoListSkeleton count={1} />);
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(1);
  });

  it("กล่องโครงร่างถูกซ่อนจาก screen reader", () => {
    const { container } = render(<PromoListSkeleton count={1} />);
    const blocks = container.querySelectorAll('[data-slot="skeleton"]');
    expect(blocks.length).toBeGreaterThan(0);
    expect(container.querySelector('[data-slot="card"]')?.getAttribute("aria-hidden")).toBe("true");
  });
});
