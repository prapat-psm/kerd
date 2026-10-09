// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendFeedback } from "@/app/actions/feedback";
import { PromoFeedback } from "./promo-feedback";

vi.mock("@/app/actions/feedback", () => ({ sendFeedback: vi.fn() }));
const action = vi.mocked(sendFeedback);
const id = "6f1c1d8e-2b1a-4c3d-9e8f-0a1b2c3d4e5f";

beforeEach(() => action.mockReset().mockResolvedValue({ status: "ok" }));
afterEach(cleanup);

const sent = () => Object.fromEntries(action.mock.calls[0][1] as FormData);

describe("PromoFeedback", () => {
  it("ถามว่าข้อมูลยังใช้ได้ไหม พร้อมปุ่ม 👍 / 👎", () => {
    render(<PromoFeedback promoId={id} />);
    expect(screen.getByRole("group", { name: "ข้อมูลนี้ยังใช้ได้ไหม" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ใช้ได้/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ไม่ถูกต้อง/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("👍 ส่งทันที แล้วขอบคุณ", async () => {
    render(<PromoFeedback promoId={id} />);
    fireEvent.click(screen.getByRole("button", { name: /ใช้ได้/ }));
    expect((await screen.findByRole("status")).textContent).toContain("ขอบคุณ");
    expect(sent()).toMatchObject({ promotionId: id, stillValid: "true" });
  });

  it("👎 เปิดฟอร์มเหตุผล เลือกแล้วส่ง", async () => {
    render(<PromoFeedback promoId={id} />);
    fireEvent.click(screen.getByRole("button", { name: /ไม่ถูกต้อง/ }));
    const form = screen.getByRole("form", { name: "แจ้งข้อมูลไม่ถูกต้อง" });
    const reasons = within(form).getByRole("radiogroup", { name: "เกิดอะไรขึ้น" });
    expect(within(reasons).getAllByRole("radio").map((r) => r.closest("label")?.textContent)).toEqual([
      "ข้อมูลผิด",
      "หน้าร้านไม่ให้ใช้สิทธิ์",
      "โปรหมดแล้ว",
      "อื่นๆ",
    ]);
    fireEvent.click(within(reasons).getByLabelText("โปรหมดแล้ว"));
    fireEvent.change(within(form).getByLabelText(/รายละเอียด/), { target: { value: "พนักงานบอกหมดแล้ว" } });
    fireEvent.change(within(form).getByLabelText(/สาขา/), { target: { value: "สยาม" } });
    fireEvent.click(within(form).getByRole("button", { name: "ส่งรายงาน" }));
    expect((await screen.findByRole("status")).textContent).toContain("ขอบคุณ");
    expect(sent()).toMatchObject({ promotionId: id, stillValid: "false", reason: "expired", note: "พนักงานบอกหมดแล้ว", branch: "สยาม", website: "" });
  });

  it("บอกผู้ใช้ไม่ให้ใส่ข้อมูลส่วนตัว และจำกัดความยาว", () => {
    render(<PromoFeedback promoId={id} />);
    fireEvent.click(screen.getByRole("button", { name: /ไม่ถูกต้อง/ }));
    const note = screen.getByLabelText(/รายละเอียด/);
    expect(note.getAttribute("maxlength")).toBe("300");
    expect(screen.getByLabelText(/สาขา/).getAttribute("maxlength")).toBe("80");
    expect(document.getElementById(note.getAttribute("aria-describedby")!)?.textContent).toContain("ไม่ต้องใส่ชื่อหรือเบอร์โทร");
  });

  it("ยกเลิกแล้วฟอร์มปิด", () => {
    render(<PromoFeedback promoId={id} />);
    fireEvent.click(screen.getByRole("button", { name: /ไม่ถูกต้อง/ }));
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.getByRole("button", { name: /ไม่ถูกต้อง/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it.each([
    ["rate_limited", "มีคนแจ้งโปรนี้เยอะมาก"],
    ["invalid", "ตรวจข้อมูลอีกครั้ง"],
    ["not_found", "ไม่พบโปรนี้แล้ว"],
  ] as const)("ผล %s แสดงข้อความ error", async (status, text) => {
    action.mockResolvedValue({ status });
    render(<PromoFeedback promoId={id} />);
    fireEvent.click(screen.getByRole("button", { name: /ใช้ได้/ }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain(text));
  });
});
