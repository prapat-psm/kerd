import { describe, expect, it } from "vitest";
import { lineLoginEnabled, LINE_AUTH_PARAMS, minimalSession, minimalToken } from "./auth-config";

describe("LINE Login (PDPA: ขอและเก็บข้อมูลน้อยที่สุด)", () => {
  it("ขอ scope แค่ openid (ไม่ขอ email/profile) และชวนเพิ่มเพื่อน LINE OA", () => {
    expect(LINE_AUTH_PARAMS).toEqual({ scope: "openid", bot_prompt: "aggressive" });
  });

  it("token เก็บแค่ LINE userId ทิ้งชื่อ รูป email", () => {
    expect(minimalToken({ sub: "U1", name: "ก", picture: "https://x", email: "a@b.c" })).toEqual({ sub: "U1" });
  });

  it("session ให้หน้าเว็บเห็นแค่ LINE userId", () => {
    expect(minimalSession({ expires: "2026-11-08", user: { name: "ก", image: "x" } }, { sub: "U1" })).toEqual({
      expires: "2026-11-08",
      user: { id: "U1" },
    });
  });

  it("เปิดใช้เมื่อตั้ง env ครบเท่านั้น", () => {
    expect(lineLoginEnabled({ AUTH_SECRET: "s", AUTH_LINE_ID: "i", AUTH_LINE_SECRET: "x" })).toBe(true);
    expect(lineLoginEnabled({ AUTH_SECRET: "s", AUTH_LINE_ID: "i" })).toBe(false);
    expect(lineLoginEnabled({})).toBe(false);
  });
});
