import { describe, expect, it } from "vitest";
import { SubmissionInput } from "./schema";

const ok = { brandName: " MK ", sourceUrl: "https://www.mkrestaurant.com/member", benefit: " เป็ดย่างฟรี ", howToRedeem: "" };

describe("SubmissionInput", () => {
  it("ตัดช่องว่าง และช่องไม่บังคับว่างเป็น null", () => {
    expect(SubmissionInput.parse(ok)).toEqual({
      brandName: "MK",
      sourceUrl: "https://www.mkrestaurant.com/member",
      benefit: "เป็ดย่างฟรี",
      howToRedeem: null,
      website: "",
    });
  });

  it("ต้องเป็น https", () => {
    expect(SubmissionInput.safeParse({ ...ok, sourceUrl: "http://www.mkrestaurant.com" }).success).toBe(false);
    expect(SubmissionInput.safeParse({ ...ok, sourceUrl: "ไม่ใช่ลิงก์" }).success).toBe(false);
  });

  it.each(["https://www.facebook.com/mk", "https://m.facebook.com/x", "https://instagram.com/x", "https://www.tiktok.com/@x", "https://page.line.me/x", "https://lin.ee/abc", "https://www.lemon8-app.com/x"])(
    "ไม่รับลิงก์โซเชียล %s (ต้องเป็นหน้าเว็บทางการ)",
    (sourceUrl) => {
      const r = SubmissionInput.safeParse({ ...ok, sourceUrl });
      expect(r.success).toBe(false);
      expect(r.error?.issues[0].path).toEqual(["sourceUrl"]);
    },
  );

  it("ต้องมีชื่อแบรนด์และสิทธิ์ที่ได้ จำกัดความยาว", () => {
    expect(SubmissionInput.safeParse({ ...ok, brandName: " " }).success).toBe(false);
    expect(SubmissionInput.safeParse({ ...ok, benefit: "" }).success).toBe(false);
    expect(SubmissionInput.safeParse({ ...ok, brandName: "ก".repeat(81) }).success).toBe(false);
    expect(SubmissionInput.safeParse({ ...ok, benefit: "ก".repeat(301) }).success).toBe(false);
    expect(SubmissionInput.safeParse({ ...ok, howToRedeem: "ก".repeat(301) }).success).toBe(false);
  });

  it("ไม่รับข้อมูลติดต่อ (PDPA: ไม่เก็บข้อมูลผู้แจ้ง)", () => {
    expect(SubmissionInput.parse({ ...ok, email: "a@b.c", name: "ก" })).not.toHaveProperty("email");
  });
});
