import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

// ทุกหน้าหลักต้องผ่าน WCAG 2.1 AA ทั้งธีมสว่างและมืด (ต้องมีโปร published อย่างน้อย 1 ใบ ดู scripts/e2e-fixture.sql)
const PAGES = ["/", "/brand", "/brand/mk-restaurants", "/privacy", "/terms", "/submit"];

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

test("หน้าแรกแสดงการ์ดโปรทันที ไม่ต้องเลือกเดือน", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
});

test("ลิงก์หน้าเดือนเดิม (/october, /birthday/october) ย้ายไปหน้าแรก", async ({ page }) => {
  for (const old of ["/october", "/birthday/october"]) {
    await page.goto(old);
    await expect(page).toHaveURL(/\/$/);
  }
});

// ตัวกรองอยู่ใน panel ไม่มีตัวเลขจำนวน: ตรวจจากข้อความ "X จาก N โปร" แทน
async function filterInPanel(page: Page, pick: (panel: Locator) => Locator) {
  // ปิด animation ไม่ให้ axe ตรวจตอน panel ยัง fade อยู่ (สีจางกว่าจริง)
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const status = page.getByRole("status").first();
  const total = Number((await status.textContent())?.match(/\d+/)?.[0]);
  await page.getByRole("button", { name: "ตัวกรอง" }).click();
  const panel = page.getByRole("dialog", { name: "ตัวกรอง" });
  await expect(panel).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include("[role=dialog]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  const option = pick(panel);
  await expect(option).not.toContainText(/\d/);
  await option.click();
  await panel.getByRole("button", { name: "ดูโปร" }).click();
  await expect(panel).toHaveCount(0);
  const [shown, of] = ((await status.textContent())?.match(/\d+/g) ?? []).map(Number);
  expect(of).toBe(total);
  expect(shown).toBeLessThan(total);
  await expect(page.locator('[data-slot="card"]')).toHaveCount(Math.min(shown, 5));
}

test("กรองตามช่วงที่ใช้ได้ใน panel แล้วเหลือเฉพาะโปรช่วงนั้น", async ({ page }) => {
  await filterInPanel(page, (panel) => panel.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" }).locator('[role="radio"]:not([disabled])').nth(1));
});

test("กรองหมวดใน panel แล้วเหลือเฉพาะหมวดนั้น", async ({ page }) => {
  await filterInPanel(page, (panel) => panel.getByRole("group", { name: "กรองตามหมวด" }).getByRole("button").nth(1));
});

test("หน้าแรกโหลดทีละ 5 ใบ เลื่อนถึงท้ายแล้วโหลดเพิ่ม", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-slot="card"]');
  await expect(cards).toHaveCount(5);
  await page.getByRole("button", { name: "ดูเพิ่ม" }).scrollIntoViewIfNeeded();
  await expect.poll(() => cards.count()).toBeGreaterThan(5);
});

test("skip link พาไปเนื้อหาหลักด้วยคีย์บอร์ด", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
  const card = page.locator('[data-slot="card"]').first();
  // วิธีใช้สิทธิ์และปุ่ม 👍/👎 พับอยู่ในการ์ด ต้องแตะเปิดก่อน
  await card.locator("summary").click();
  await expect(card.getByRole("list", { name: "วิธีใช้สิทธิ์" })).toBeVisible();
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
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /เตือนฉันก่อนเดือนเกิด/ })).toHaveCount(0);
  const res = await page.goto("/remind");
  expect(res?.status()).toBe(404);
});

test("SEO: robots, sitemap, canonical และ structured data", async ({ page, request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/october</loc>");
  expect(sitemap).toContain("/brand/mk-restaurants</loc>");
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.map((t) => JSON.parse(t)["@type"])).toEqual(["ItemList"]);
});

for (const scheme of ["light", "dark"] as const) {
  test(`privacy และ T&C เปิดเป็น dialog จาก footer ผ่าน axe และปิดแล้วกลับหน้าเดิม (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto("/brand");
    const footer = page.getByRole("navigation", { name: "ลิงก์ท้ายเว็บ" });
    for (const [link, path, title] of [
      ["ความเป็นส่วนตัวและคุกกี้", "/privacy", "นโยบายความเป็นส่วนตัวและคุกกี้"],
      ["ข้อกำหนดการใช้งาน", "/terms", "ข้อกำหนดการใช้งาน"],
    ]) {
      await footer.getByRole("link", { name: link }).click();
      const dialog = page.getByRole("dialog", { name: title });
      await expect(dialog).toBeVisible();
      await expect(page).toHaveURL(path);
      const { violations } = await new AxeBuilder({ page }).include("[role=dialog]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(page).toHaveURL("/brand");
    }
  });
}

test("เปิด /privacy ตรงๆ ได้หน้าเต็ม ไม่มี dialog", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "นโยบายความเป็นส่วนตัวและคุกกี้" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
