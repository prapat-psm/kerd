import { describe, expect, it } from "vitest";
import { FEEDBACK_REASONS, FeedbackInput, reasonLabel } from "./schema";

const id = "6f1c1d8e-2b1a-4c3d-9e8f-0a1b2c3d4e5f";

describe("FeedbackInput", () => {
  it("👍 ส่งแค่ promotionId + stillValid", () => {
    expect(FeedbackInput.parse({ promotionId: id, stillValid: "true" })).toEqual({
      promotionId: id,
      stillValid: true,
      reason: null,
      note: null,
      branch: null,
      website: "",
    });
  });

  it("👎 ต้องเลือกเหตุผล", () => {
    const r = FeedbackInput.safeParse({ promotionId: id, stillValid: "false" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["reason"]);
  });

  it("👎 + เหตุผล + รายละเอียด/สาขา (ตัดช่องว่าง)", () => {
    expect(
      FeedbackInput.parse({ promotionId: id, stillValid: "false", reason: "store_refused", note: "  พนักงานบอกหมดแล้ว ", branch: " สยาม " }),
    ).toMatchObject({ stillValid: false, reason: "store_refused", note: "พนักงานบอกหมดแล้ว", branch: "สยาม" });
  });

  it("ช่องว่างเปล่ากลายเป็น null", () => {
    expect(FeedbackInput.parse({ promotionId: id, stillValid: "false", reason: "expired", note: "  ", branch: "" })).toMatchObject({
      note: null,
      branch: null,
    });
  });

  it("เหตุผล 'อื่นๆ' ต้องอธิบาย", () => {
    const r = FeedbackInput.safeParse({ promotionId: id, stillValid: "false", reason: "other" });
    expect(r.error?.issues[0].path).toEqual(["note"]);
    expect(FeedbackInput.safeParse({ promotionId: id, stillValid: "false", reason: "other", note: "ต้องซื้อขั้นต่ำ 500" }).success).toBe(true);
  });

  it("จำกัดความยาว รายละเอียด 300 / สาขา 80", () => {
    expect(FeedbackInput.safeParse({ promotionId: id, stillValid: "false", reason: "expired", note: "ก".repeat(301) }).success).toBe(false);
    expect(FeedbackInput.safeParse({ promotionId: id, stillValid: "false", reason: "expired", branch: "ก".repeat(81) }).success).toBe(false);
  });

  it("ปฏิเสธ id ที่ไม่ใช่ uuid และเหตุผลนอกรายการ", () => {
    expect(FeedbackInput.safeParse({ promotionId: "x", stillValid: "true" }).success).toBe(false);
    expect(FeedbackInput.safeParse({ promotionId: id, stillValid: "false", reason: "spam" }).success).toBe(false);
    expect(FeedbackInput.safeParse({ promotionId: id, stillValid: "maybe" }).success).toBe(false);
  });

  it("👍 ไม่เก็บเหตุผล/รายละเอียดแม้ส่งมา", () => {
    expect(FeedbackInput.parse({ promotionId: id, stillValid: "true", reason: "expired", note: "x", branch: "y" })).toMatchObject({
      reason: null,
      note: null,
      branch: null,
    });
  });
});

describe("reasonLabel", () => {
  it("มีป้ายภาษาไทยครบทุกเหตุผล", () => {
    expect(FEEDBACK_REASONS.map(reasonLabel)).toEqual(["ข้อมูลผิด", "หน้าร้านไม่ให้ใช้สิทธิ์", "โปรหมดแล้ว", "อื่นๆ"]);
  });
});
