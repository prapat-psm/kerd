import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// ทุกหน้าหลักต้องผ่าน WCAG 2.1 AA ทั้งธีมสว่างและมืด (ต้องมีโปร published อย่างน้อย 1 ใบ ดู scripts/e2e-fixture.sql)
const PAGES = ["/", "/october", "/brand", "/brand/mk-restaurants", "/privacy", "/terms", "/submit"];

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
  await page.goto("/october");
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
});

test("ลิงก์เก่า /birthday/october ย้ายไป /october", async ({ page }) => {
  await page.goto("/birthday/october");
  await expect(page).toHaveURL(/\/october$/);
});

test("กรองหมวดบนหน้าเดือนแล้วเหลือเฉพาะหมวดนั้น", async ({ page }) => {
  await page.goto("/october");
  const group = page.getByRole("group", { name: "กรองตามหมวด" });
  const all = await page.locator('[data-slot="card"]').count();
  const chip = group.getByRole("button").nth(1);
  const expected = Number(await chip.locator("span").last().textContent());
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-slot="card"]')).toHaveCount(expected);
  expect(expected).toBeLessThan(all);
});

test("skip link พาไปเนื้อหาหลักด้วยคีย์บอร์ด", async ({ page }) => {
  await page.goto("/october");
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

test("👎 ต้องเลือกเหตุผล แล้วส่งรายงานได้", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/october");
  const card = page.locator('[data-slot="card"]').first();
  await card.getByRole("button", { name: /ไม่ถูกต้อง/ }).click();
  const form = card.getByRole("form", { name: "แจ้งข้อมูลไม่ถูกต้อง" });
  await form.getByText("หน้าร้านไม่ให้ใช้สิทธิ์").click();
  await form.getByLabel(/สาขา/).fill("สาขาทดสอบ e2e");
  const { violations } = await new AxeBuilder({ page }).include('[data-slot="card"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await form.getByRole("button", { name: "ส่งรายงาน" }).click();
  await expect(card.getByRole("status")).toContainText("ขอบคุณ");
});

test("แจ้งโปรจาก footer แล้วเข้าคิว", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "ลิงก์ท้ายเว็บ" }).getByRole("link", { name: "แจ้งโปรที่ยังไม่มี" }).click();
  await page.getByLabel("ชื่อแบรนด์").fill("แบรนด์ทดสอบ e2e");
  await page.getByLabel(/ลิงก์หน้าเว็บทางการ/).fill("https://example.com/birthday");
  await page.getByLabel("ได้สิทธิ์อะไร").fill("ของขวัญวันเกิด");
  await page.getByRole("button", { name: "ส่งให้ทีมตรวจ" }).click();
  await expect(page.getByRole("status")).toContainText("ตรวจกับหน้าเว็บทางการ");
});

test("ฟีเจอร์ LINE พักไว้: ไม่มีปุ่มเตือนฉัน และ /remind เป็น 404", async ({ page }) => {
  await page.goto("/october");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /เตือนฉันก่อนเดือนเกิด/ })).toHaveCount(0);
  const res = await page.goto("/remind");
  expect(res?.status()).toBe(404);
});

test("SEO: robots, sitemap, canonical และ structured data", async ({ page, request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/october</loc>");
  expect(sitemap).toContain("/brand/mk-restaurants</loc>");
  await page.goto("/october");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/october$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.map((t) => JSON.parse(t)["@type"])).toEqual(["ItemList", "BreadcrumbList"]);
});
