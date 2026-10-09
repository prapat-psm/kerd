import { DOWNVOTE_THRESHOLD, DOWNVOTE_WINDOW_DAYS } from "@/lib/freshness";
import { escapeHtml } from "@/lib/watcher/digest";
import { reasonLabel, type FeedbackReason } from "./schema";

export type FeedbackEmailInput = {
  brandName: string;
  title: string;
  sourceUrl: string;
  reason: FeedbackReason;
  note: string | null;
  branch: string | null;
  downvotes: number;
};

/** email แจ้งทีมทุกครั้งที่มี 👎; ทุกค่าจากผู้ใช้/DB ถูก escape */
export function renderFeedbackEmail(r: FeedbackEmailInput): { subject: string; html: string } {
  const count = `${r.downvotes}/${DOWNVOTE_THRESHOLD} ใน ${DOWNVOTE_WINDOW_DAYS} วัน`;
  const row = (label: string, value: string | null) => `<dt>${label}</dt><dd>${value ? escapeHtml(value) : "-"}</dd>`;
  const html = [
    `<h2>${escapeHtml(r.brandName)}: ${escapeHtml(r.title)}</h2>`,
    `<dl>${row("เหตุผล", reasonLabel(r.reason))}${row("รายละเอียด", r.note)}${row("สาขา", r.branch)}${row("👎 หลังตรวจล่าสุด", count)}</dl>`,
    r.downvotes >= DOWNVOTE_THRESHOLD ? "<p><strong>ครบเกณฑ์ ขึ้นป้าย ⚠️ แล้ว ควรตรวจและ verify ใหม่</strong></p>" : "",
    `<p><a href="${escapeHtml(r.sourceUrl)}">เปิดหน้าเว็บทางการ</a></p>`,
  ].join("");
  return { subject: `[Kerd] 👎 ${r.brandName}: ${reasonLabel(r.reason)} (${count})`, html };
}
