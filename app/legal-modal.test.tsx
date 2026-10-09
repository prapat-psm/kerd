// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ModalDefault from "./@modal/default";
import PrivacyModal from "./@modal/(.)privacy/page";
import TermsModal from "./@modal/(.)terms/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));

afterEach(cleanup);

describe("privacy และ T&C เปิดเป็น dialog เมื่อกดจากในเว็บ", () => {
  it("privacy: dialog มีเนื้อหาเดียวกับหน้าเต็ม", () => {
    render(<PrivacyModal />);
    expect(screen.getByRole("dialog", { name: "นโยบายความเป็นส่วนตัวและคุกกี้" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "สิทธิ์ของคุณ" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "เปิดเป็นหน้าเต็ม" }).getAttribute("href")).toBe("/privacy");
  });

  it("terms: dialog มีเนื้อหาเดียวกับหน้าเต็ม", () => {
    render(<TermsModal />);
    expect(screen.getByRole("dialog", { name: "ข้อกำหนดการใช้งาน" })).toBeTruthy();
    expect(screen.getByText(/เงื่อนไขของแบรนด์เป็นที่สุด/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "เปิดเป็นหน้าเต็ม" }).getAttribute("href")).toBe("/terms");
  });

  it("หน้าอื่นไม่มี dialog", () => {
    expect(ModalDefault()).toBeNull();
  });
});
