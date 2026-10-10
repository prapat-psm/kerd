import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import manifest from "./manifest";
import { viewport } from "./layout";

// next/font ทำงานได้เฉพาะตอน build ของ Next.js
vi.mock("next/font/google", () => ({ IBM_Plex_Sans_Thai: () => ({ variable: "" }) }));

// PWA: ติดตั้ง Kerd ลงหน้าจอหลัก (S4.1) สร้างไฟล์ PNG ใน public/icons ใหม่ด้วย `npm run icons`
const branding = readFileSync(join(process.cwd(), "docs/branding.md"), "utf8");
const token = (name: string) => {
  const row = branding.match(new RegExp(`^\\|\\s*\`--${name}\`\\s*\\|[^|]*\\|\\s*\`(#[0-9A-Fa-f]{6})\`[^|]*\\|\\s*\`(#[0-9A-Fa-f]{6})\``, "m"))!;
  return { light: row[1].toUpperCase(), dark: row[2].toUpperCase() };
};
const bg = token("bg");
const m = manifest();
const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("manifest", () => {
  it("เปิดเป็นแอปเต็มจอที่หน้าแรก", () => {
    expect(m.name).toContain("Kerd");
    expect(m.short_name).toBe("Kerd");
    expect(m.lang).toBe("th");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
  });

  it("ใช้สีพื้นหลังของแบรนด์ระหว่างเปิดแอป", () => {
    expect(m.background_color?.toUpperCase()).toBe(bg.light);
    expect(m.theme_color?.toUpperCase()).toBe(bg.light);
  });

  it("มีไอคอน 192 และ 512 และไอคอน maskable สำหรับ Android", () => {
    const icons = m.icons ?? [];
    expect(icons.map((i) => `${i.sizes} ${i.purpose ?? "any"}`).sort()).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
  });

  it.each((manifest().icons ?? []).map((i) => [i.src, i.sizes] as const))("%s มีไฟล์จริงตามขนาด %s", async (src, sizes) => {
    expect(existsSync(publicFile(src))).toBe(true);
    const meta = await sharp(publicFile(src)).metadata();
    expect(`${meta.width}x${meta.height}`).toBe(sizes);
    expect(meta.hasAlpha).toBe(false);
  });

  it("ไอคอน maskable เต็มพื้นสีแบรนด์ถึงขอบ เพื่อให้ Android ตัดเป็นวงกลมได้", async () => {
    const maskable = (m.icons ?? []).find((i) => i.purpose === "maskable")!;
    const { data } = await sharp(publicFile(maskable.src)).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
    const hex = `#${[...data.subarray(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    expect(hex).toBe(bg.light);
  });
});

describe("viewport", () => {
  it("แถบสถานะเบราว์เซอร์ใช้สีพื้นหลังตามธีมสว่าง/มืด", () => {
    expect(viewport.themeColor).toEqual([
      { media: "(prefers-color-scheme: light)", color: bg.light },
      { media: "(prefers-color-scheme: dark)", color: bg.dark },
    ]);
  });
});
