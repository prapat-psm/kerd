export type EmailEnv = { RESEND_API_KEY?: string; DIGEST_TO?: string; DIGEST_FROM?: string };
type Fetch = (url: string, init: RequestInit) => Promise<{ ok: boolean; status?: number }>;

/** ส่ง email ถึงทีมผ่าน Resend; ยังไม่ตั้ง env = ข้าม (dev/preview) */
export async function sendResendEmail(
  { subject, html }: { subject: string; html: string },
  env: EmailEnv,
  fetch: Fetch,
): Promise<"sent" | "skipped"> {
  if (!env.RESEND_API_KEY || !env.DIGEST_TO || !env.DIGEST_FROM) return "skipped";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.DIGEST_FROM, to: [env.DIGEST_TO], subject, html }),
  });
  if (!res.ok) throw new Error(`resend_${res.status}`);
  return "sent";
}
