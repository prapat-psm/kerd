import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// docs/branding.md คือแหล่งความจริงของสี; globals.css ต้องตรงทุกค่า ทั้งโหมดสว่างและมืด
const branding = readFileSync(join(process.cwd(), "docs/branding.md"), "utf8");
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

const rows = [...branding.matchAll(/^\|\s*`(--[\w-]+)`\s*\|\s*`(--[\w-]+)`\s*\|\s*`(#[0-9A-Fa-f]{6})`[^|]*\|\s*`(#[0-9A-Fa-f]{6})`/gm)].map(
  ([, token, cssVar, light, dark]) => ({ token, cssVar, light: light.toLowerCase(), dark: dark.toLowerCase() }),
);

function block(source: string, start: number): string {
  const open = source.indexOf("{", start);
  return source.slice(open + 1, source.indexOf("}", open));
}

const lightBlock = block(css, css.indexOf(":root"));
const darkStart = css.indexOf("@media (prefers-color-scheme: dark)");
const darkBlock = block(css, css.indexOf(":root", darkStart));

function valueOf(cssBlock: string, name: string): string | undefined {
  return cssBlock.match(new RegExp(`(?:^|[\\s;])${name}:\\s*([^;]+);`))?.[1].trim().toLowerCase();
}

describe("design tokens", () => {
  it("อ่านตารางสีจาก branding.md ได้ครบ 8 token", () => {
    expect(rows.map((r) => r.token)).toEqual(["--brand", "--ink", "--muted", "--surface", "--bg", "--fresh", "--due", "--warn"]);
  });

  it.each(rows)("$token ($cssVar) ตรงกับ branding.md ในโหมดสว่าง", ({ cssVar, light }) => {
    expect(valueOf(lightBlock, cssVar)).toBe(light);
  });

  it.each(rows)("$token ($cssVar) ตรงกับ branding.md ในโหมดมืด", ({ cssVar, dark }) => {
    expect(darkStart).toBeGreaterThan(-1);
    expect(valueOf(darkBlock, cssVar)).toBe(dark);
  });

  it("ข้อความบนปุ่ม coral ใช้สี ink ไม่ใช่สีขาว", () => {
    const ink = rows.find((r) => r.token === "--ink")!;
    expect(valueOf(lightBlock, "--primary-foreground")).toBe(ink.light);
  });
});
