import { describe, expect, it, vi } from "vitest";
import { submitPromo, type SubmissionDeps } from "./submit";

const now = new Date("2026-10-09T10:00:00Z");
const input = { brandName: "MK", sourceUrl: "https://www.mkrestaurant.com/member", benefit: "เป็ดย่างฟรี", howToRedeem: "แสดงบัตร" };

function deps(over: Partial<SubmissionDeps> = {}): SubmissionDeps {
  return {
    countSince: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue(undefined),
    sendEmail: vi.fn().mockResolvedValue(undefined),
    log: vi.fn(),
    ...over,
  };
}

describe("submitPromo", () => {
  it("บันทึกเข้าคิว pending และ email ทีม", async () => {
    const d = deps();
    expect(await submitPromo(input, d, now)).toEqual({ status: "ok" });
    expect(d.create).toHaveBeenCalledWith({
      sourceUrl: input.sourceUrl,
      payload: { brandName: "MK", benefit: "เป็ดย่างฟรี", howToRedeem: "แสดงบัตร" },
    });
    expect(vi.mocked(d.sendEmail).mock.calls[0][0].subject).toBe("[Kerd] มีคนแจ้งโปรใหม่: MK");
  });

  it("ข้อมูลไม่ผ่าน: ไม่บันทึก", async () => {
    const d = deps();
    expect(await submitPromo({ ...input, sourceUrl: "https://facebook.com/mk" }, d, now)).toEqual({ status: "invalid" });
    expect(d.create).not.toHaveBeenCalled();
  });

  it("ช่องดักบอท: ตอบสำเร็จแต่ไม่บันทึก", async () => {
    const d = deps();
    expect(await submitPromo({ ...input, website: "x" }, d, now)).toEqual({ status: "ok" });
    expect(d.create).not.toHaveBeenCalled();
  });

  it("ทั้งเว็บรับได้ไม่เกิน 20 รายการต่อชั่วโมง", async () => {
    const countSince = vi.fn().mockResolvedValue(20);
    const d = deps({ countSince });
    expect(await submitPromo(input, d, now)).toEqual({ status: "rate_limited" });
    expect(countSince).toHaveBeenCalledWith(new Date("2026-10-09T09:00:00Z"));
    expect(d.create).not.toHaveBeenCalled();
  });

  it("email ล้มเหลว ผู้ใช้ยังสำเร็จ", async () => {
    const d = deps({ sendEmail: vi.fn().mockRejectedValue(new Error("resend_500")) });
    expect(await submitPromo(input, d, now)).toEqual({ status: "ok" });
    expect(d.log).toHaveBeenCalledWith("submission_email_failed", "resend_500");
  });

  it("error ที่ไม่ใช่ Error ก็ log ได้", async () => {
    const d = deps({ sendEmail: vi.fn().mockRejectedValue("boom") });
    await submitPromo(input, d, now);
    expect(d.log).toHaveBeenCalledWith("submission_email_failed", "boom");
  });
});
