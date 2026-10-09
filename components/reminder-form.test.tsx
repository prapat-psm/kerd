// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAccountAction, saveReminderAction } from "@/app/actions/account";
import { ReminderForm } from "./reminder-form";

vi.mock("@/app/actions/account", () => ({ saveReminderAction: vi.fn(), deleteAccountAction: vi.fn() }));
const save = vi.mocked(saveReminderAction);
const del = vi.mocked(deleteAccountAction);

beforeEach(() => {
  save.mockReset().mockResolvedValue({ status: "saved" });
  del.mockReset().mockResolvedValue({ status: "deleted" });
});
afterEach(cleanup);

const sent = () => Object.fromEntries(save.mock.calls[0][1] as FormData);

describe("ReminderForm", () => {
  it("ผู้ใช้ใหม่: เลือกเดือนจากหน้าที่มา ช่องยินยอมไม่ติ๊กไว้ก่อน", () => {
    render(<ReminderForm account={null} defaultMonth={10} />);
    expect((screen.getByLabelText("เดือนเกิด") as HTMLSelectElement).value).toBe("10");
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    expect(screen.queryByRole("button", { name: /ลบข้อมูลของฉัน/ })).toBeNull();
  });

  it("ข้อความขอความยินยอมบอกว่าส่งอะไร กี่ครั้ง และถอนได้", () => {
    render(<ReminderForm account={null} />);
    const label = screen.getByRole("checkbox").closest("label")!.textContent;
    expect(label).toContain("ปีละไม่เกิน 2 ครั้ง");
    expect(label).toContain("ยกเลิกได้ทุกเมื่อ");
  });

  it("ไม่มีช่องปีเกิด", () => {
    render(<ReminderForm account={null} />);
    expect(screen.queryByLabelText(/ปีเกิด/)).toBeNull();
  });

  it("ส่งเดือน วัน และความยินยอม แล้วแจ้งว่าบันทึกแล้ว", async () => {
    render(<ReminderForm account={null} defaultMonth={10} />);
    fireEvent.change(screen.getByLabelText("วันเกิด (ไม่บังคับ)"), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));
    expect((await screen.findByRole("status")).textContent).toContain("บันทึกแล้ว");
    expect(sent()).toEqual({ birthMonth: "10", birthDay: "9", marketingConsent: "on" });
  });

  it("ผู้ใช้เดิม: แสดงค่าที่เก็บไว้ และลบข้อมูลได้หลังยืนยัน", async () => {
    render(<ReminderForm account={{ birthMonth: 3, birthDay: 1, marketingConsent: true }} defaultMonth={10} />);
    expect((screen.getByLabelText("เดือนเกิด") as HTMLSelectElement).value).toBe("3");
    expect((screen.getByLabelText("วันเกิด (ไม่บังคับ)") as HTMLInputElement).value).toBe("1");
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "ลบข้อมูลของฉัน" }));
    expect(del).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันลบ" }));
    expect((await screen.findByRole("status")).textContent).toContain("ลบข้อมูลแล้ว");
  });

  it("ข้อมูลไม่ถูกต้อง แจ้ง error", async () => {
    save.mockResolvedValue({ status: "invalid" });
    render(<ReminderForm account={null} defaultMonth={2} />);
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));
    expect((await screen.findByRole("alert")).textContent).toContain("ตรวจวันเกิด");
  });

  it("หมดเวลาเข้าสู่ระบบ แจ้งให้เข้าใหม่", async () => {
    save.mockResolvedValue({ status: "unauthenticated" });
    render(<ReminderForm account={null} defaultMonth={2} />);
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));
    expect((await screen.findByRole("alert")).textContent).toContain("เข้าสู่ระบบใหม่");
  });
});
