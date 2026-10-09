// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LegalDialog } from "./legal-dialog";

const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ back }) }));

afterEach(() => {
  cleanup();
  back.mockClear();
});

const renderDialog = () =>
  render(
    <LegalDialog title="ข้อกำหนดการใช้งาน" updated="9 ต.ค. 2569" href="/terms">
      <h2>Kerd คืออะไร</h2>
    </LegalDialog>,
  );

describe("LegalDialog", () => {
  it("เปิดเป็น dialog ทันที ชื่อ dialog คือหัวข้อ และมีเนื้อหา", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "ข้อกำหนดการใช้งาน" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/ปรับปรุงล่าสุด 9 ต.ค. 2569/)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Kerd คืออะไร" })).toBeTruthy();
  });

  it("มีลิงก์เปิดเป็นหน้าเต็ม (ลิงก์ตรงยังใช้แชร์ได้)", () => {
    renderDialog();
    expect(screen.getByRole("link", { name: "เปิดเป็นหน้าเต็ม" }).getAttribute("href")).toBe("/terms");
  });

  it("ปิดด้วยปุ่มปิดแล้วย้อนกลับหน้าเดิม", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "ปิด" }));
    expect(back).toHaveBeenCalledOnce();
  });

  it("ปิดด้วย Escape แล้วย้อนกลับหน้าเดิม", () => {
    renderDialog();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(back).toHaveBeenCalledOnce();
  });
});
