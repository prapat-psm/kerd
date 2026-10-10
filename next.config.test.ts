import { describe, expect, it } from "vitest";
import config from "./next.config";

describe("next.config redirects", () => {
  it("ลิงก์เก่า /birthday/:month ย้ายถาวรไปหน้าแรก", async () => {
    const redirects = await config.redirects!();
    expect(redirects).toContainEqual({ source: "/birthday/:month", destination: "/", permanent: true });
  });

  it("หน้าเดือนเดิม (/october ฯลฯ) ย้ายถาวรไปหน้าแรก โดยไม่จับหน้าอื่นอย่าง /brand", async () => {
    const redirects = await config.redirects!();
    const month = redirects.find((r) => r.source.startsWith("/:month("))!;
    expect(month).toMatchObject({ destination: "/", permanent: true });
    const pattern = new RegExp(`^/${month.source.slice("/:month".length)}$`);
    expect(["/january", "/october", "/december"].every((p) => pattern.test(p))).toBe(true);
    expect(["/brand", "/submit", "/privacy", "/"].some((p) => pattern.test(p))).toBe(false);
  });
});
