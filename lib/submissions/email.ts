import { escapeHtml } from "@/lib/watcher/digest";
import type { SubmissionData } from "./schema";

type Fields = Omit<SubmissionData, "website">;

/** email แจ้งทีมเมื่อมีคนแจ้งโปรใหม่; ทุกค่าจากผู้ใช้ถูก escape */
export function renderSubmissionEmail(s: Fields): { subject: string; html: string } {
  const row = (label: string, value: string | null) => `<dt>${label}</dt><dd>${value ? escapeHtml(value) : "-"}</dd>`;
  const html = [
    `<dl>${row("แบรนด์", s.brandName)}${row("สิทธิ์", s.benefit)}${row("วิธีใช้", s.howToRedeem)}</dl>`,
    `<p><a href="${escapeHtml(s.sourceUrl)}">${escapeHtml(s.sourceUrl)}</a></p>`,
    "<p>ข้อมูลจากผู้ใช้ ยังไม่ได้ยืนยัน: ตรวจที่หน้าเว็บทางการและเขียนคำอธิบายเองก่อนเพิ่มเป็นโปร</p>",
  ].join("");
  return { subject: `[Kerd] มีคนแจ้งโปรใหม่: ${s.brandName}`, html };
}
