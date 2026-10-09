import { DOWNVOTE_THRESHOLD, DOWNVOTE_WINDOW_DAYS } from "@/lib/freshness";
import { renderFeedbackEmail } from "./email";
import { FeedbackInput, type FeedbackReason } from "./schema";

/** กันสแปมแบบไม่ต้องเก็บ IP: จำกัดจำนวนต่อโปรต่อชั่วโมง */
export const MAX_PER_PROMO_PER_HOUR = 30;

export type FeedbackRecord = {
  promotionId: string;
  stillValid: boolean;
  reason: FeedbackReason | null;
  note: string | null;
  branch: string | null;
};

export type FeedbackDeps = {
  findPublishedPromo(id: string): Promise<{ brandName: string; title: string; sourceUrl: string; lastVerifiedAt: Date | null } | null>;
  countSince(id: string, since: Date, where?: { stillValid: boolean }): Promise<number>;
  create(data: FeedbackRecord): Promise<unknown>;
  sendEmail(msg: { subject: string; html: string }): Promise<unknown>;
  revalidate(): void;
  log(event: string, detail: string): void;
};

export type FeedbackResult = { status: "ok" | "invalid" | "not_found" | "rate_limited" };

export async function submitFeedback(raw: unknown, deps: FeedbackDeps, now = new Date()): Promise<FeedbackResult> {
  const parsed = FeedbackInput.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const { website, ...data } = parsed.data;
  if (website) return { status: "ok" };

  const promo = await deps.findPublishedPromo(data.promotionId);
  if (!promo) return { status: "not_found" };

  const hourAgo = new Date(now.getTime() - 3_600_000);
  if ((await deps.countSince(data.promotionId, hourAgo)) >= MAX_PER_PROMO_PER_HOUR) return { status: "rate_limited" };

  await deps.create(data);
  if (data.stillValid || !data.reason) return { status: "ok" };

  // นับแบบเดียวกับ freshnessStatus: 👎 ใน 7 วัน ที่ใหม่กว่าวันตรวจล่าสุด
  const windowStart = new Date(now.getTime() - DOWNVOTE_WINDOW_DAYS * 86_400_000);
  const since = promo.lastVerifiedAt && promo.lastVerifiedAt > windowStart ? promo.lastVerifiedAt : windowStart;
  const downvotes = await deps.countSince(data.promotionId, since, { stillValid: false });
  if (downvotes === DOWNVOTE_THRESHOLD) deps.revalidate();

  try {
    await deps.sendEmail(renderFeedbackEmail({ ...promo, reason: data.reason, note: data.note, branch: data.branch, downvotes }));
  } catch (e) {
    deps.log("feedback_email_failed", e instanceof Error ? e.message : String(e));
  }
  return { status: "ok" };
}
