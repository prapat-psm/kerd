// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

const pressed = (name: string) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("ThemeToggle", () => {
  it("มีกลุ่มปุ่มที่มีชื่อ และ 3 ตัวเลือก", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("group", { name: "ธีมสี" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("ค่าเริ่มต้นคือตามระบบ", () => {
    render(<ThemeToggle />);
    expect(pressed("ตามระบบ")).toBe("true");
    expect(pressed("มืด")).toBe("false");
  });

  it("กดมืดแล้วเปลี่ยนธีมและจำไว้", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "มืด" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(pressed("มืด")).toBe("true");
    expect(pressed("ตามระบบ")).toBe("false");
  });

  it("เปิดหน้ามาพร้อมธีมที่เคยเลือก", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    expect(pressed("สว่าง")).toBe("true");
  });

  it("ซิงก์เมื่อเปลี่ยนธีมจากแท็บอื่น และเลิกฟังเมื่อถูกถอดออก", () => {
    const { unmount } = render(<ThemeToggle />);
    localStorage.setItem("theme", "dark");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
    });
    expect(pressed("มืด")).toBe("true");

    const remove = vi.spyOn(window, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("storage", expect.any(Function));
    remove.mockRestore();
  });
});
