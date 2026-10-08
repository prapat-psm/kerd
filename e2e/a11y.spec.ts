import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// ทุกหน้าหลักต้องผ่าน WCAG 2.1 AA ทั้งธีมสว่างและมืด (ต้องมีโปร published อย่างน้อย 1 ใบ ดู scripts/e2e-fixture.sql)
const PAGES = ["/", "/birthday/october", "/brand/mk-restaurants"];

for (const scheme of ["light", "dark"] as const) {
  for (const path of PAGES) {
    test(`${path} ผ่าน axe (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
}

test("หน้าเดือนมีการ์ดโปรให้ตรวจ", async ({ page }) => {
  await page.goto("/birthday/october");
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
});

test("skip link พาไปเนื้อหาหลักด้วยคีย์บอร์ด", async ({ page }) => {
  await page.goto("/birthday/october");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "ข้ามไปเนื้อหาหลัก" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("เลือกธีมมืดแล้วจำไว้ และไม่กระพริบตอนโหลดใหม่", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "มืด" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "มืด" })).toHaveAttribute("aria-pressed", "true");

  // ตั้งก่อน paint แรก: อ่านค่าตั้งแต่ DOMContentLoaded
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(14, 19, 32)");
});
