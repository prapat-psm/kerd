import { describe, expect, it, vi } from "vitest";
import { sendResendEmail } from "./email";

const env = { RESEND_API_KEY: "re_test", DIGEST_TO: "team@example.com", DIGEST_FROM: "Kerd <bot@example.com>" };
const msg = { subject: "s", html: "<p>h</p>" };

describe("sendResendEmail", () => {
  it("POST ไป Resend พร้อม key ใน header", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    expect(await sendResendEmail(msg, env, fetch)).toBe("sent");
    expect(fetch).toHaveBeenCalledWith("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer re_test", "content-type": "application/json" },
      body: JSON.stringify({ from: env.DIGEST_FROM, to: [env.DIGEST_TO], subject: "s", html: "<p>h</p>" }),
    });
  });

  it("ยังไม่ตั้ง env: ข้ามโดยไม่ยิง", async () => {
    const fetch = vi.fn();
    expect(await sendResendEmail(msg, { ...env, RESEND_API_KEY: undefined }, fetch)).toBe("skipped");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Resend ตอบ error: throw พร้อม status", async () => {
    await expect(sendResendEmail(msg, env, vi.fn().mockResolvedValue({ ok: false, status: 422 }))).rejects.toThrow("resend_422");
  });
});
