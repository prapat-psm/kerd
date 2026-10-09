// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromoCard } from "./promo-card";
import type { PromoCardData } from "@/lib/promos/view";

vi.mock("@/app/actions/feedback", () => ({ sendFeedback: vi.fn() }));

afterEach(cleanup);

const card: PromoCardData = {
  id: "p1",
  title: "โปรวันเกิด MK",
  benefit: "เป็ดย่าง 1 จาน",
  window: "month",
  windowLabel: "ใช้ได้ทั้งเดือนเกิด",
  period: null,
  tiers: [
    { tier: "Silver", benefit: "ลด 10%", conditions: [] },
    { tier: "Gold", benefit: "เป็ดย่าง 1 จาน", conditions: ["ยอดขั้นต่ำ 500 บาท"] },
  ],
  requiresMembership: true,
  membershipName: "MK Member",
  requiredTier: "Gold",
  conditions: ["ทานที่ร้านเท่านั้น"],
  howToRedeem: ["แสดงบัตรสมาชิก", "แจ้งพนักงานว่าใช้สิทธิ์วันเกิด"],
  sourceUrl: "https://example.com/mk",
  lastVerifiedAt: new Date("2026-10-08T03:00:00Z"),
  freshness: "fresh",
  brand: { name: "MK Restaurants", slug: "mk-restaurants", category: "food" },
};

describe("PromoCard", () => {
  it("แสดงชื่อแบรนด์ สิทธิ์ และช่วงเวลาที่ใช้ได้", () => {
    render(<PromoCard promo={card} />);
    expect(screen.getByRole("heading", { name: "MK Restaurants" })).toBeTruthy();
    expect(screen.getAllByText("เป็ดย่าง 1 จาน").length).toBeGreaterThan(0);
    expect(screen.getByText("ใช้ได้ทั้งเดือนเกิด")).toBeTruthy();
  });

  it("แสดงวิธีใช้สิทธิ์เป็นขั้นตอนตามลำดับ", () => {
    render(<PromoCard promo={card} />);
    const steps = within(screen.getByRole("list", { name: "วิธีใช้สิทธิ์" })).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent)).toEqual(["แสดงบัตรสมาชิก", "แจ้งพนักงานว่าใช้สิทธิ์วันเกิด"]);
  });

  it("แสดงทุก tier ในการ์ดเดียว", () => {
    render(<PromoCard promo={card} />);
    expect(screen.getByText("Silver")).toBeTruthy();
    expect(screen.getByText("Gold", { selector: "dt" })).toBeTruthy();
  });

  it("บอกว่าต้องเป็นสมาชิกระดับไหน", () => {
    render(<PromoCard promo={card} />);
    expect(screen.getByText("ต้องเป็นสมาชิก MK Member ระดับ Gold ขึ้นไป")).toBeTruthy();
  });

  it("มีลิงก์ไปหน้าเว็บทางการ เปิดแท็บใหม่อย่างปลอดภัย", () => {
    render(<PromoCard promo={card} />);
    const link = screen.getByRole("link", { name: /ตรวจสิทธิ์ที่หน้าเว็บทางการ/ });
    expect(link.getAttribute("href")).toBe("https://example.com/mk");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("แสดงวันที่ตรวจล่าสุด badge และข้อความให้ตรวจที่ต้นทาง", () => {
    render(<PromoCard promo={card} />);
    expect(screen.getByText("ตรวจล่าสุดเมื่อ 8 ต.ค. 2569")).toBeTruthy();
    expect(screen.getByText("ตรวจแล้ว")).toBeTruthy();
    expect(screen.getByText(/เพื่อความถูกต้อง กรุณากดลิงก์เพื่อตรวจสิทธิ์ที่ต้นทางอีกครั้ง/)).toBeTruthy();
  });

  it("โปรที่ยังไม่เคยตรวจ บอกตรงๆ", () => {
    render(<PromoCard promo={{ ...card, lastVerifiedAt: null, freshness: "due" }} />);
    expect(screen.getByText("ยังไม่ได้ตรวจ")).toBeTruthy();
    expect(screen.getByText("ถึงรอบตรวจ")).toBeTruthy();
  });

  it("badge เตือนเมื่อมีคนแจ้งปัญหา", () => {
    render(<PromoCard promo={{ ...card, freshness: "warn" }} />);
    expect(screen.getByText("มีคนแจ้งปัญหา")).toBeTruthy();
  });

  it("ลิงก์ชื่อแบรนด์ไปหน้าแบรนด์ได้เมื่อขอ", () => {
    render(<PromoCard promo={card} linkBrand />);
    expect(screen.getByRole("link", { name: "MK Restaurants" }).getAttribute("href")).toBe("/brand/mk-restaurants");
  });
  it("มีปุ่ม 👍/👎 ให้ผู้ใช้แจ้งว่าข้อมูลยังใช้ได้ไหม", () => {
    render(<PromoCard promo={card} />);
    expect(screen.getByRole("group", { name: "ข้อมูลนี้ยังใช้ได้ไหม" })).toBeTruthy();
  });
});

describe("PromoCard: ช่วงเวลาของโปร", () => {
  it("โปรที่มีวันหมดอายุ แสดงว่าใช้ได้ถึงวันไหน", () => {
    render(<PromoCard promo={{ ...card, period: "ใช้ได้ถึง 31 ธ.ค. 2569" }} />);
    expect(screen.getByText("ใช้ได้ถึง 31 ธ.ค. 2569")).toBeTruthy();
  });

  it("โปรที่ไม่มีช่วงเวลา ไม่แสดงอะไรเพิ่ม", () => {
    render(<PromoCard promo={card} />);
    expect(screen.queryByText(/ใช้ได้ถึง/)).toBeNull();
  });
});
