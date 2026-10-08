// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { THEME_SCRIPT, applyTheme, parseTheme, readStoredTheme, saveTheme } from "./theme";

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("parseTheme", () => {
  it("รับเฉพาะ light, dark, system", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBe("system");
  });

  it("ค่าอื่นหรือไม่มีค่า ถือเป็น system", () => {
    expect(parseTheme(null)).toBe("system");
    expect(parseTheme("blue")).toBe("system");
  });
});

describe("applyTheme", () => {
  it("light/dark ตั้ง data-theme บน <html>", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("system ลบ data-theme ให้ใช้ค่าจากระบบ", () => {
    applyTheme("dark");
    applyTheme("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});

describe("saveTheme / readStoredTheme", () => {
  it("จำธีมที่เลือกไว้", () => {
    saveTheme("dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("system ลบค่าที่เก็บไว้", () => {
    saveTheme("dark");
    saveTheme("system");
    expect(localStorage.getItem("theme")).toBeNull();
    expect(readStoredTheme()).toBe("system");
  });
});

describe("THEME_SCRIPT", () => {
  it("ใส่ธีมที่เก็บไว้ก่อนหน้าเว็บแสดงผล (กันจอกระพริบ)", () => {
    localStorage.setItem("theme", "dark");
    new Function(THEME_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("ไม่ตั้งค่าที่ไม่รู้จัก", () => {
    localStorage.setItem("theme", "<script>");
    new Function(THEME_SCRIPT)();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
