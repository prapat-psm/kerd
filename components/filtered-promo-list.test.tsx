// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PromoCardData } from "@/lib/promos/view";
import { FilteredPromoList } from "./filtered-promo-list";

afterEach(cleanup);

function promo(id: string, name: string, category: string, window: PromoCardData["window"] = "month"): PromoCardData {
  return {
    id,
    title: `โปร ${name}`,
    benefit: "ส่วนลด",
    requiresMembership: false,
    membershipName: null,
    requiredTier: null,
    conditions: [],
    howToRedeem: ["แสดงบัตรประชาชน"],
    sourceUrl: `https://example.com/${id}`,
    lastVerifiedAt: new Date("2026-10-01"),
    brand: { name, slug: id, category },
    window,
    windowLabel: "ใช้ได้ทั้งเดือนเกิด",
    period: null,
    tiers: null,
    freshness: "fresh",
  };
}

const promos = [promo("a", "MK", "food"), promo("b", "KBank", "bank", "day"), promo("c", "Sizzler", "food", "week")];
const cards = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("FilteredPromoList", () => {
  it("มีกลุ่มปุ่มหมวด และเริ่มที่ 'ทั้งหมด' แสดงทุกการ์ด", () => {
    render(<FilteredPromoList promos={promos} />);
    const group = screen.getByRole("group", { name: "กรองตามหมวด" });
    expect(within(group).getByRole("button", { name: /ทั้งหมด/ }).getAttribute("aria-pressed")).toBe("true");
    expect(cards()).toEqual(["MK", "KBank", "Sizzler"]);
  });

  it("กดหมวดแล้วเหลือเฉพาะการ์ดหมวดนั้น และบอกจำนวนให้ screen reader", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
    expect(screen.getByRole("button", { name: /อาหาร/ }).getAttribute("aria-pressed")).toBe("true");
    expect(cards()).toEqual(["MK", "Sizzler"]);
    expect(screen.getByRole("status").textContent).toContain("2 โปร");
  });

  it("กลับมา 'ทั้งหมด' ได้", () => {
    render(<FilteredPromoList promos={promos} />);
    const group = screen.getByRole("group", { name: "กรองตามหมวด" });
    fireEvent.click(within(group).getByRole("button", { name: /ธนาคาร/ }));
    fireEvent.click(within(group).getByRole("button", { name: /ทั้งหมด/ }));
    expect(cards()).toHaveLength(3);
  });

  it("มีหมวดเดียวไม่ต้องแสดงตัวกรอง", () => {
    render(<FilteredPromoList promos={[promos[0]]} />);
    expect(screen.queryByRole("group", { name: "กรองตามหมวด" })).toBeNull();
  });

  it("กรองตามช่วงที่ใช้ได้ (วันเกิด / สัปดาห์ / ทั้งเดือน)", () => {
    render(<FilteredPromoList promos={promos} />);
    const group = screen.getByRole("group", { name: "กรองตามช่วงที่ใช้ได้" });
    fireEvent.click(within(group).getByRole("button", { name: /^วันเกิด/ }));
    expect(cards()).toEqual(["KBank"]);
  });

  it("ใช้ตัวกรองหมวดและช่วงร่วมกันได้", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
    fireEvent.click(within(screen.getByRole("group", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("button", { name: /สัปดาห์วันเกิด/ }));
    expect(cards()).toEqual(["Sizzler"]);
  });

  it("ถ้ากรองแล้วไม่เหลือโปร บอกให้ลองเปลี่ยนตัวกรอง", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(screen.getByRole("button", { name: /ธนาคาร/ }));
    fireEvent.click(within(screen.getByRole("group", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("button", { name: /สัปดาห์วันเกิด/ }));
    expect(screen.getByText("ไม่มีโปรที่ตรงกับตัวกรองนี้")).toBeTruthy();
  });

  it("ทุกโปรใช้ได้ช่วงเดียวกัน ไม่ต้องแสดงตัวกรองช่วง", () => {
    render(<FilteredPromoList promos={[promos[0]]} />);
    expect(screen.queryByRole("group", { name: "กรองตามช่วงที่ใช้ได้" })).toBeNull();
  });

  it("แต่ละแถวตัวกรองมีป้ายบอกว่ากรองอะไร", () => {
    render(<FilteredPromoList promos={promos} />);
    expect(screen.getByText("หมวด")).toBeTruthy();
    expect(screen.getByText("ใช้ได้ช่วง")).toBeTruthy();
  });

  describe("ช่องค้นหา", () => {
    const search = () => screen.getByRole("searchbox", { name: "ค้นหาโปรหรือแบรนด์" });

    it("พิมพ์ชื่อแบรนด์แล้วเหลือเฉพาะการ์ดที่ตรง", () => {
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(search(), { target: { value: "sizz" } });
      expect(cards()).toEqual(["Sizzler"]);
      expect(screen.getByRole("status").textContent).toContain("1 โปร");
    });

    it("ใช้ร่วมกับตัวกรองหมวดได้", () => {
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(search(), { target: { value: "โปร" } });
      fireEvent.click(screen.getByRole("button", { name: /ธนาคาร/ }));
      expect(cards()).toEqual(["KBank"]);
    });

    it("ไม่เจอ บอกคำที่ค้น และกดล้างคำค้นเพื่อกลับมาเห็นทุกการ์ด", () => {
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(search(), { target: { value: "starbucks" } });
      expect(screen.getByText(/ไม่พบโปรที่ตรงกับ “starbucks”/)).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "ล้างคำค้น" }));
      expect((search() as HTMLInputElement).value).toBe("");
      expect(cards()).toHaveLength(3);
    });

    it("ยังไม่ได้พิมพ์ ไม่ต้องมีปุ่มล้างคำค้น", () => {
      render(<FilteredPromoList promos={promos} />);
      expect(screen.queryByRole("button", { name: "ล้างคำค้น" })).toBeNull();
    });
  });
});
