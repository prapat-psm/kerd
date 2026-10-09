import { describe, expect, it, vi } from "vitest";
import { submitFeedback, type FeedbackDeps } from "./submit";

const id = "6f1c1d8e-2b1a-4c3d-9e8f-0a1b2c3d4e5f";
const now = new Date("2026-10-09T10:00:00Z");
const promo = { brandName: "MK", title: "ของขวัญวันเกิด", sourceUrl: "https://mk.example/promo", lastVerifiedAt: new Date("2026-10-08T00:00:00Z") };

function deps(over: Partial<FeedbackDeps> = {}): FeedbackDeps {
  return {
    findPublishedPromo: vi.fn().mockResolvedValue(promo),
    countSince: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue(undefined),
    sendEmail: vi.fn().mockResolvedValue(undefined),
    revalidate: vi.fn(),
    log: vi.fn(),
    ...over,
  };
}

const down = { promotionId: id, stillValid: "false", reason: "expired", note: "ร้านบอกหมดแล้ว" };

describe("submitFeedback", () => {
  it("👍 บันทึกโดยไม่ส่ง email", async () => {
    const d = deps();
    expect(await submitFeedback({ promotionId: id, stillValid: "true" }, d, now)).toEqual({ status: "ok" });
    expect(d.create).toHaveBeenCalledWith({ promotionId: id, stillValid: true, reason: null, note: null, branch: null });
    expect(d.sendEmail).not.toHaveBeenCalled();
  });

  it("👎 บันทึก และส่ง email พร้อมจำนวน 👎 ตั้งแต่ตรวจล่าสุดใน 7 วัน", async () => {
    const countSince = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(3);
    const d = deps({ countSince });
    expect(await submitFeedback(down, d, now)).toEqual({ status: "ok" });
    expect(d.create).toHaveBeenCalledWith({ promotionId: id, stillValid: false, reason: "expired", note: "ร้านบอกหมดแล้ว", branch: null });
    // นับ 👎 หลังวันตรวจล่าสุด (ใหม่กว่าเริ่มหน้าต่าง 7 วัน)
    expect(countSince).toHaveBeenLastCalledWith(id, promo.lastVerifiedAt, { stillValid: false });
    const mail = vi.mocked(d.sendEmail).mock.calls[0][0];
    expect(mail.subject).toBe("[Kerd] 👎 MK: โปรหมดแล้ว (3/7 ใน 7 วัน)");
    expect(d.revalidate).not.toHaveBeenCalled();
  });

  it("ไม่เคยตรวจ: นับย้อน 7 วัน", async () => {
    const countSince = vi.fn().mockResolvedValue(1);
    await submitFeedback(down, deps({ countSince, findPublishedPromo: vi.fn().mockResolvedValue({ ...promo, lastVerifiedAt: null }) }), now);
    expect(countSince).toHaveBeenLastCalledWith(id, new Date("2026-10-02T10:00:00Z"), { stillValid: false });
  });

  it("👎 ครบ 7 ครั้ง ล้าง cache ให้ป้าย ⚠️ ขึ้นทันที", async () => {
    const d = deps({ countSince: vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(7) });
    await submitFeedback(down, d, now);
    expect(d.revalidate).toHaveBeenCalledOnce();
  });

  it("ข้อมูลไม่ผ่าน Zod: ไม่บันทึก", async () => {
    const d = deps();
    expect(await submitFeedback({ promotionId: id, stillValid: "false" }, d, now)).toEqual({ status: "invalid" });
    expect(d.create).not.toHaveBeenCalled();
  });

  it("ไม่พบโปรที่เผยแพร่", async () => {
    const d = deps({ findPublishedPromo: vi.fn().mockResolvedValue(null) });
    expect(await submitFeedback(down, d, now)).toEqual({ status: "not_found" });
    expect(d.create).not.toHaveBeenCalled();
  });

  it("กรอกช่องดักบอท: ตอบว่าสำเร็จแต่ไม่บันทึก", async () => {
    const d = deps();
    expect(await submitFeedback({ ...down, website: "http://spam" }, d, now)).toEqual({ status: "ok" });
    expect(d.findPublishedPromo).not.toHaveBeenCalled();
    expect(d.create).not.toHaveBeenCalled();
  });

  it("โปรเดียวรับได้ไม่เกิน 30 ครั้งต่อชั่วโมง (ไม่ต้องเก็บ IP)", async () => {
    const countSince = vi.fn().mockResolvedValue(30);
    const d = deps({ countSince });
    expect(await submitFeedback(down, d, now)).toEqual({ status: "rate_limited" });
    expect(countSince).toHaveBeenCalledWith(id, new Date("2026-10-09T09:00:00Z"));
    expect(d.create).not.toHaveBeenCalled();
  });

  it("ส่ง email ไม่ได้ ผู้ใช้ยังสำเร็จ และ log ไว้", async () => {
    const d = deps({ sendEmail: vi.fn().mockRejectedValue(new Error("resend_500")) });
    expect(await submitFeedback(down, d, now)).toEqual({ status: "ok" });
    expect(d.log).toHaveBeenCalledWith("feedback_email_failed", "resend_500");
  });

  it("error ที่ไม่ใช่ Error ก็ log ได้", async () => {
    const d = deps({ sendEmail: vi.fn().mockRejectedValue("boom") });
    await submitFeedback(down, d, now);
    expect(d.log).toHaveBeenCalledWith("feedback_email_failed", "boom");
  });
});
