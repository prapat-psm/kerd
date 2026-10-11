// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PromoCardData } from "@/lib/promos/view";
import { FilteredPromoList, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "./filtered-promo-list";

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

// ตัวกรองอยู่ใน panel: ขณะเปิด Radix ซ่อนส่วนอื่นจาก a11y tree จึงนับการ์ดแบบรวมที่ถูกซ่อนด้วย
const cards = () =>
  screen
    .getAllByRole("heading", { level: 2, hidden: true })
    .filter((h) => !h.closest("[role=dialog]"))
    .map((h) => h.textContent);
const panel = () => screen.getByRole("dialog", { name: "ตัวกรอง" });
const openPanel = () => {
  if (!screen.queryByRole("dialog")) fireEvent.click(screen.getByRole("button", { name: "ตัวกรอง" }));
  return panel();
};
const categories = () => within(openPanel()).getByRole("group", { name: "กรองตามหมวด" });
const windows = () => within(openPanel()).getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" });
const pickCategory = (name: RegExp) => fireEvent.click(within(categories()).getByRole("button", { name }));
const pickWindow = (name: RegExp) => fireEvent.click(within(windows()).getByRole("radio", { name }));

describe("FilteredPromoList", () => {
  it("ตัวกรองไม่วางบนหน้า มีปุ่ม 'ตัวกรอง' เปิด panel แทน และเริ่มที่ 'ทั้งหมด' แสดงทุกการ์ด", () => {
    render(<FilteredPromoList promos={promos} />);
    expect(screen.queryByRole("group", { name: "กรองตามหมวด" })).toBeNull();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    const button = screen.getByRole("button", { name: "ตัวกรอง" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(within(categories()).getByRole("button", { name: "ทั้งหมด" }).getAttribute("aria-pressed")).toBe("true");
    expect(cards()).toEqual(["MK", "KBank", "Sizzler"]);
  });

  it("ตัวเลือกใน panel ไม่มีตัวเลขจำนวน", () => {
    render(<FilteredPromoList promos={promos} />);
    const labels = [...within(categories()).getAllByRole("button"), ...within(windows()).getAllByRole("radio")].map((b) => b.textContent);
    expect(labels).toEqual(["ทั้งหมด", "อาหาร", "ธนาคาร", "ทั้งหมด", "วันเกิด", "สัปดาห์", "ทั้งเดือน"].map((l) => expect.stringContaining(l)));
    labels.forEach((l) => expect(l).not.toMatch(/\d/));
  });

  it("กดหมวดใน panel แล้วรายการกรองทันที บอกจำนวนให้ screen reader และกด 'ดูโปร' ปิด panel", () => {
    render(<FilteredPromoList promos={promos} />);
    pickCategory(/อาหาร/);
    expect(within(categories()).getByRole("button", { name: /อาหาร/ }).getAttribute("aria-pressed")).toBe("true");
    expect(cards()).toEqual(["MK", "Sizzler"]);
    fireEvent.click(within(panel()).getByRole("button", { name: "ดูโปร" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("2 จาก 3 โปร");
  });

  it("ปุ่มตัวกรองมีจุดบอกว่ากำลังกรองอยู่", () => {
    render(<FilteredPromoList promos={promos} />);
    expect(screen.getByRole("button", { name: "ตัวกรอง" }).hasAttribute("data-active")).toBe(false);
    pickCategory(/ธนาคาร/);
    fireEvent.click(within(panel()).getByRole("button", { name: "ดูโปร" }));
    expect(screen.getByRole("button", { name: "ตัวกรอง" }).hasAttribute("data-active")).toBe(true);
  });

  it("กลับมา 'ทั้งหมด' ได้", () => {
    render(<FilteredPromoList promos={promos} />);
    pickCategory(/ธนาคาร/);
    pickCategory(/ทั้งหมด/);
    expect(cards()).toHaveLength(3);
  });

  it("มีหมวดเดียวและช่วงเดียว ไม่ต้องมีปุ่มตัวกรอง", () => {
    render(<FilteredPromoList promos={[promos[0]]} />);
    expect(screen.queryByRole("button", { name: "ตัวกรอง" })).toBeNull();
  });

  it("กรองตามช่วงที่ใช้ได้ (วันเกิด / สัปดาห์ / ทั้งเดือน)", () => {
    render(<FilteredPromoList promos={promos} />);
    pickWindow(/^วันเกิด/);
    expect(cards()).toEqual(["KBank"]);
  });

  it("ใช้ตัวกรองหมวดและช่วงร่วมกันได้", () => {
    render(<FilteredPromoList promos={promos} />);
    pickCategory(/อาหาร/);
    pickWindow(/^สัปดาห์/);
    expect(cards()).toEqual(["Sizzler"]);
  });

  it("เลือกหมวดแล้ว ช่วงที่หมวดนั้นไม่มีกดไม่ได้", () => {
    render(<FilteredPromoList promos={promos} />);
    pickCategory(/อาหาร/);
    expect(within(windows()).getAllByRole("radio").map((r) => [r.textContent, r.hasAttribute("disabled")])).toEqual([
      ["ทั้งหมด", false],
      ["วันเกิด", true],
      ["สัปดาห์", false],
      ["ทั้งเดือน", false],
    ]);
  });

  it("เปลี่ยนไปหมวดที่ไม่มีช่วงที่เลือกไว้ กลับเป็น 'ทั้งหมด' ไม่ค้างหน้าว่าง", () => {
    render(<FilteredPromoList promos={promos} />);
    pickWindow(/^สัปดาห์/);
    pickCategory(/ธนาคาร/);
    expect(within(windows()).getByRole("radio", { name: /ทั้งหมด/ }).getAttribute("aria-checked")).toBe("true");
    expect(cards()).toEqual(["KBank"]);
  });

  it("ถ้ากรองแล้วไม่เหลือโปร บอกให้ลองเปลี่ยนตัวกรอง", () => {
    vi.useFakeTimers();
    render(<FilteredPromoList promos={promos} />);
    pickWindow(/^วันเกิด/);
    fireEvent.click(within(panel()).getByRole("button", { name: "ดูโปร" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sizzler" } });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    vi.useRealTimers();
    expect(screen.getByText(/ยังไม่มีโปรที่ตรงกับ/)).toBeTruthy();
  });

  it("ทุกโปรใช้ได้ช่วงเดียวกัน ใน panel ไม่ต้องมีตัวกรองช่วง", () => {
    render(<FilteredPromoList promos={[promos[0], promos[1]].map((p) => ({ ...p, window: "month" as const }))} />);
    expect(within(openPanel()).queryByRole("radiogroup")).toBeNull();
  });

  it("ในจอเล็ก panel เป็นแผ่นเลื่อนจากขอบล่าง", () => {
    render(<FilteredPromoList promos={promos} />);
    expect(openPanel().className).toContain("max-sm:bottom-0");
  });

  // โหลดทีละ 5 ใบ: เลื่อนถึงท้ายรายการ (IntersectionObserver) หรือกด "ดูเพิ่ม"
  describe("โหลดทีละ 5", () => {
    const many = Array.from({ length: 12 }, (_, i) => promo(`p${i}`, `แบรนด์ ${i + 1}`, i % 2 ? "bank" : "food"));
    const more = () => screen.queryByRole("button", { name: "ดูเพิ่ม" });

    afterEach(() => vi.unstubAllGlobals());

    it(`เริ่มที่ ${PAGE_SIZE} ใบ กดดูเพิ่มได้ทีละ ${PAGE_SIZE} จนครบ แล้วปุ่มหายไป`, () => {
      render(<FilteredPromoList promos={many} />);
      expect(PAGE_SIZE).toBe(5);
      expect(cards()).toHaveLength(5);
      fireEvent.click(more()!);
      expect(cards()).toHaveLength(10);
      fireEvent.click(more()!);
      expect(cards()).toHaveLength(12);
      expect(more()).toBeNull();
    });

    it("เลื่อนถึงท้ายรายการแล้วโหลดเพิ่มเอง", () => {
      let fire = () => {};
      vi.stubGlobal(
        "IntersectionObserver",
        class {
          constructor(cb: IntersectionObserverCallback) {
            fire = () => cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
          }
          observe() {}
          disconnect() {}
        },
      );
      render(<FilteredPromoList promos={many} />);
      expect(cards()).toHaveLength(5);
      act(() => fire());
      expect(cards()).toHaveLength(10);
    });

    it("เปลี่ยนตัวกรองแล้วกลับไปเริ่มที่ 5 ใบ", () => {
      render(<FilteredPromoList promos={many} />);
      fireEvent.click(more()!);
      pickCategory(/อาหาร/);
      expect(cards()).toHaveLength(5);
      expect(screen.getByRole("status", { hidden: true }).textContent).toContain("6 จาก 12 โปร");
    });
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
      pickCategory(/ธนาคาร/);
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
      pickCategory(/อาหาร/);
      pickWindow(/^สัปดาห์/);
      fireEvent.click(within(panel()).getByRole("button", { name: "ดูโปร" }));
      expect(status()).toBe("1 จาก 3 โปร");
      fireEvent.click(clearFilters()!);
      expect(cards()).toHaveLength(3);
      expect(clearFilters()).toBeNull();
      expect(within(categories()).getByRole("button", { name: /ทั้งหมด/ }).getAttribute("aria-pressed")).toBe("true");
      expect(within(windows()).getByRole("radio", { name: /ทั้งหมด/ }).getAttribute("aria-checked")).toBe("true");
    });

    it("ใน panel มีปุ่ม 'ล้าง' เมื่อกรองอยู่ กดแล้วกลับไปที่ 'ทั้งหมด'", () => {
      render(<FilteredPromoList promos={promos} />);
      expect(within(openPanel()).queryByRole("button", { name: "ล้าง" })).toBeNull();
      pickCategory(/อาหาร/);
      fireEvent.click(within(panel()).getByRole("button", { name: "ล้าง" }));
      expect(within(categories()).getByRole("button", { name: /ทั้งหมด/ }).getAttribute("aria-pressed")).toBe("true");
      expect(cards()).toHaveLength(3);
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
