import { describe, expect, it } from "vitest";
import { robotsAllows } from "./robots";

const UA = "KerdBot";

describe("robotsAllows", () => {
  it("ไม่มี robots.txt (ว่าง) = อนุญาต", () => {
    expect(robotsAllows("", "/promo", UA)).toBe(true);
  });

  it("Disallow: / สำหรับทุก bot = ห้าม", () => {
    expect(robotsAllows("User-agent: *\nDisallow: /", "/promo", UA)).toBe(false);
  });

  it("ห้ามเฉพาะ path ที่ขึ้นต้นตรงกัน", () => {
    const txt = "User-agent: *\nDisallow: /member/";
    expect(robotsAllows(txt, "/member/birthday", UA)).toBe(false);
    expect(robotsAllows(txt, "/promo/birthday", UA)).toBe(true);
  });

  it("กลุ่มที่ระบุชื่อ bot เราชนะกลุ่ม *", () => {
    const txt = "User-agent: *\nDisallow: /\n\nUser-agent: KerdBot\nDisallow: /private";
    expect(robotsAllows(txt, "/promo", UA)).toBe(true);
    expect(robotsAllows(txt, "/private/x", UA)).toBe(false);
  });

  it("Allow ที่ยาวกว่าชนะ Disallow", () => {
    const txt = "User-agent: *\nDisallow: /promo\nAllow: /promo/birthday";
    expect(robotsAllows(txt, "/promo/birthday", UA)).toBe(true);
    expect(robotsAllows(txt, "/promo/other", UA)).toBe(false);
  });

  it("ข้าม comment และ Disallow ว่าง", () => {
    expect(robotsAllows("# hi\nUser-agent: *\nDisallow:\n", "/x", UA)).toBe(true);
  });
});
