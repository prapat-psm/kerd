"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { sendResendEmail } from "@/lib/email";
import { submitFeedback, type FeedbackResult } from "@/lib/feedback/submit";

/** Server Action ของฟอร์ม 👍/👎 บนการ์ดโปร (ตรวจด้วย Zod ใน submitFeedback) */
export async function sendFeedback(_prev: FeedbackResult | null, form: FormData): Promise<FeedbackResult> {
  return submitFeedback(Object.fromEntries(form), {
    findPublishedPromo: async (id) => {
      const p = await prisma.promotion.findFirst({
        where: { id, status: "published" },
        select: { title: true, sourceUrl: true, lastVerifiedAt: true, brand: { select: { name: true } } },
      });
      return p && { brandName: p.brand.name, title: p.title, sourceUrl: p.sourceUrl, lastVerifiedAt: p.lastVerifiedAt };
    },
    countSince: (promotionId, since, where) => prisma.promoFeedback.count({ where: { promotionId, createdAt: { gte: since }, ...where } }),
    create: (data) => prisma.promoFeedback.create({ data }),
    sendEmail: (msg) => sendResendEmail(
        msg,
        { RESEND_API_KEY: process.env.RESEND_API_KEY, DIGEST_TO: process.env.DIGEST_TO, DIGEST_FROM: process.env.DIGEST_FROM },
        fetch,
      ),
    revalidate: () => revalidateTag("promos", "max"),
    log: (event, detail) => console.error(event, detail),
  });
}
