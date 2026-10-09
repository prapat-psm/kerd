import { renderSubmissionEmail } from "./email";
import { SubmissionInput } from "./schema";

/** กันสแปมทั้งเว็บโดยไม่ต้องเก็บ IP */
export const MAX_SUBMISSIONS_PER_HOUR = 20;

export type SubmissionDeps = {
  countSince(since: Date): Promise<number>;
  create(data: { sourceUrl: string; payload: { brandName: string; benefit: string; howToRedeem: string | null } }): Promise<unknown>;
  sendEmail(msg: { subject: string; html: string }): Promise<unknown>;
  log(event: string, detail: string): void;
};

export async function submitPromo(raw: unknown, deps: SubmissionDeps, now = new Date()): Promise<{ status: "ok" | "invalid" | "rate_limited" }> {
  const parsed = SubmissionInput.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const { website, ...data } = parsed.data;
  if (website) return { status: "ok" };

  if ((await deps.countSince(new Date(now.getTime() - 3_600_000))) >= MAX_SUBMISSIONS_PER_HOUR) return { status: "rate_limited" };

  const { sourceUrl, ...payload } = data;
  // เข้าคิว pending เท่านั้น ไม่แสดงบนเว็บจนกว่าทีมจะตรวจและเพิ่มเป็นโปรเอง
  await deps.create({ sourceUrl, payload });
  try {
    await deps.sendEmail(renderSubmissionEmail(data));
  } catch (e) {
    deps.log("submission_email_failed", e instanceof Error ? e.message : String(e));
  }
  return { status: "ok" };
}
