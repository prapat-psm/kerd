"use server";

import { prisma } from "@/lib/db";
import { sendResendEmail } from "@/lib/email";
import { submitPromo } from "@/lib/submissions/submit";

/** Server Action ของฟอร์มแจ้งโปร: เข้าคิว Submission (pending) ไม่แสดงบนเว็บ */
export async function sendSubmission(_prev: unknown, form: FormData) {
  return submitPromo(Object.fromEntries(form), {
    countSince: (since) => prisma.submission.count({ where: { createdAt: { gte: since } } }),
    create: (data) => prisma.submission.create({ data }),
    sendEmail: (msg) =>
      sendResendEmail(
        msg,
        { RESEND_API_KEY: process.env.RESEND_API_KEY, DIGEST_TO: process.env.DIGEST_TO, DIGEST_FROM: process.env.DIGEST_FROM },
        fetch,
      ),
    log: (event, detail) => console.error(event, detail),
  });
}
