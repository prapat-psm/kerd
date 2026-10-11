// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PromoCardData } from "@/lib/promos/view";
import { FilteredPromoList, SEARCH_DEBOUNCE_MS } from "./filtered-promo-list";

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
    expect(screen.getByRole("status").textContent).toContain("2 จาก 3 โปร");
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
    fireEvent.click(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /^วันเกิด/ }));
    expect(cards()).toEqual(["KBank"]);
  });

  it("ใช้ตัวกรองหมวดและช่วงร่วมกันได้", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
    fireEvent.click(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /^สัปดาห์/ }));
    expect(cards()).toEqual(["Sizzler"]);
  });

  it("เลือกหมวดแล้ว ตัวกรองช่วงเหลือเฉพาะช่วงที่หมวดนั้นมี พร้อมจำนวนของหมวดนั้น", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
    const radios = within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getAllByRole("radio");
    expect(radios.map((r) => [r.textContent, r.hasAttribute("disabled")])).toEqual([
      ["ทั้งหมด2", false],
      ["วันเกิด0", true],
      ["สัปดาห์1", false],
      ["ทั้งเดือน1", false],
    ]);
  });

  it("เปลี่ยนไปหมวดที่ไม่มีช่วงที่เลือกไว้ กลับเป็น 'ทั้งหมด' ไม่ค้างหน้าว่าง", () => {
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /^สัปดาห์/ }));
    fireEvent.click(screen.getByRole("button", { name: /ธนาคาร/ }));
    expect(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /ทั้งหมด/ }).getAttribute("aria-checked")).toBe("true");
    expect(cards()).toEqual(["KBank"]);
  });

  it("ถ้ากรองแล้วไม่เหลือโปร บอกให้ลองเปลี่ยนตัวกรอง", () => {
    vi.useFakeTimers();
    render(<FilteredPromoList promos={promos} />);
    fireEvent.click(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /^วันเกิด/ }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sizzler" } });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    vi.useRealTimers();
    expect(screen.getByText(/ยังไม่มีโปรที่ตรงกับ/)).toBeTruthy();
  });

  it("ทุกโปรใช้ได้ช่วงเดียวกัน ไม่ต้องแสดงตัวกรองช่วง", () => {
    render(<FilteredPromoList promos={[promos[0]]} />);
    expect(screen.queryByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).toBeNull();
  });

  it("ไม่มีป้ายหน้าแถวตัวกรอง (ชื่อกลุ่มอยู่ใน aria-label) หมวดเป็นแถวเดียวชิดขอบจอ", () => {
    render(<FilteredPromoList promos={promos} />);
    expect(screen.queryByText("หมวด")).toBeNull();
    expect(screen.queryByText("ใช้ได้ช่วง")).toBeNull();
    expect(screen.getByRole("group", { name: "กรองตามหมวด" }).className).toContain("-mx-4");
  });

  describe("ช่องค้นหา", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const search = () => screen.getByRole("combobox", { name: "ค้นหาโปรหรือแบรนด์" });
    const type = (value: string) => {
      fireEvent.change(search(), { target: { value } });
      act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    };

    it("รอให้หยุดพิมพ์ก่อน (debounce) แล้วจึงกรองการ์ด", () => {
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(search(), { target: { value: "sizz" } });
      expect(cards()).toHaveLength(3);
      act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
      expect(cards()).toEqual(["Sizzler"]);
      expect(screen.getByRole("status").textContent).toContain("1 จาก 3 โปร");
    });

    it("ใช้ร่วมกับตัวกรองหมวดได้", () => {
      render(<FilteredPromoList promos={promos} />);
      type("โปร");
      fireEvent.click(screen.getByRole("button", { name: /ธนาคาร/ }));
      expect(cards()).toEqual(["KBank"]);
    });

    it("แสดงรายชื่อแบรนด์ที่ตรงกับคำค้นให้เลือก", () => {
      render(<FilteredPromoList promos={promos} />);
      type("k");
      const list = screen.getByRole("listbox", { name: "แบรนด์ที่ตรงกับคำค้น" });
      expect(within(list).getAllByRole("option").map((o) => o.textContent)).toEqual([expect.stringContaining("KBank"), expect.stringContaining("MK")]);
      expect(search().getAttribute("aria-expanded")).toBe("true");
    });

    it("คลิกเลือกแบรนด์แล้วเหลือเฉพาะโปรของแบรนด์นั้น และปิดรายการ", () => {
      render(<FilteredPromoList promos={promos} />);
      type("k");
      fireEvent.click(screen.getByRole("option", { name: /KBank/ }));
      expect((search() as HTMLInputElement).value).toBe("KBank");
      expect(cards()).toEqual(["KBank"]);
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("เลือกแบรนด์ด้วยคีย์บอร์ด: ลูกศรลงแล้ว Enter", () => {
      render(<FilteredPromoList promos={promos} />);
      type("k");
      fireEvent.keyDown(search(), { key: "ArrowDown" });
      fireEvent.keyDown(search(), { key: "ArrowDown" });
      expect(search().getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: /MK/ }).id);
      fireEvent.keyDown(search(), { key: "Enter" });
      expect(cards()).toEqual(["MK"]);
    });

    it("กด Escape ปิดรายการแบรนด์ โดยยังคงคำค้นไว้", () => {
      render(<FilteredPromoList promos={promos} />);
      type("k");
      fireEvent.keyDown(search(), { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
      expect((search() as HTMLInputElement).value).toBe("k");
    });

    it("พิมพ์ต่อหลังเลือกแบรนด์ กลับไปค้นแบบปกติ", () => {
      render(<FilteredPromoList promos={promos} />);
      type("k");
      fireEvent.click(screen.getByRole("option", { name: /KBank/ }));
      type("โปร");
      expect(cards()).toHaveLength(3);
    });

    it("ไม่เจอ บอกคำที่ค้น และกดล้างคำค้นเพื่อกลับมาเห็นทุกการ์ดทันที", () => {
      render(<FilteredPromoList promos={promos} />);
      type("starbucks");
      expect(screen.getByText(/ยังไม่มีโปรที่ตรงกับ “starbucks”/)).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "ล้างคำค้น" }));
      expect((search() as HTMLInputElement).value).toBe("");
      expect(cards()).toHaveLength(3);
    });

    it("ยังไม่ได้พิมพ์ ไม่ต้องมีปุ่มล้างคำค้นและรายการแบรนด์", () => {
      render(<FilteredPromoList promos={promos} />);
      expect(screen.queryByRole("button", { name: "ล้างคำค้น" })).toBeNull();
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  // P1-5 ตัวกรองบอกผล และผลว่างมีทางไปต่อ
  describe("ผลการกรอง", () => {
    const status = () => screen.getByRole("status").textContent;
    const clearFilters = () => screen.queryByRole("button", { name: "ล้างตัวกรอง" });

    it("ยังไม่กรอง แสดงจำนวนโปรทั้งหมด ไม่มีปุ่มล้างตัวกรอง", () => {
      render(<FilteredPromoList promos={promos} />);
      expect(status()).toBe("3 โปร");
      expect(clearFilters()).toBeNull();
    });

    it("กรองอยู่ บอก 'X จาก N โปร' และกดล้างตัวกรองกลับไปที่ 'ทั้งหมด' ทุกแถว", () => {
      render(<FilteredPromoList promos={promos} />);
      fireEvent.click(screen.getByRole("button", { name: /อาหาร/ }));
      fireEvent.click(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /^สัปดาห์/ }));
      expect(status()).toBe("1 จาก 3 โปร");
      fireEvent.click(clearFilters()!);
      expect(within(screen.getByRole("group", { name: "กรองตามหมวด" })).getByRole("button", { name: /ทั้งหมด/ }).getAttribute("aria-pressed")).toBe("true");
      expect(within(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).getByRole("radio", { name: /ทั้งหมด/ }).getAttribute("aria-checked")).toBe("true");
      expect(cards()).toHaveLength(3);
      expect(clearFilters()).toBeNull();
    });

    it("ล้างตัวกรองแล้วคำค้นหายไปด้วย", () => {
      vi.useFakeTimers();
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "starbucks" } });
      act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
      vi.useRealTimers();
      expect(status()).toBe("0 จาก 3 โปร");
      fireEvent.click(screen.getAllByRole("button", { name: "ล้างตัวกรอง" })[0]);
      expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
      expect(cards()).toHaveLength(3);
    });

    it("ค้นไม่เจอ มีลิงก์ 'แจ้งเราได้' ไปหน้า /submit", () => {
      vi.useFakeTimers();
      render(<FilteredPromoList promos={promos} />);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "starbucks" } });
      act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
      vi.useRealTimers();
      expect(screen.getByRole("link", { name: /แจ้งเราได้/ }).getAttribute("href")).toBe("/submit");
      expect(screen.getAllByRole("button", { name: "ล้างตัวกรอง" }).length).toBeGreaterThan(0);
    });
  });
});
