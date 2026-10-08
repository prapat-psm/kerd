import type { CheckResult } from "./types";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeLink(url: string, label: string): string {
  try {
    if (new URL(url).protocol === "https:") return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
  } catch {
    // ตกไปด้านล่าง
  }
  return `${escapeHtml(label)} (ลิงก์ไม่ปลอดภัย)`;
}

/** สรุปรายการที่ต้องให้คนตรวจ ส่งทาง email; ทุกค่าจาก DB/เว็บถูก escape ก่อนใส่ HTML */
export function renderDigest(results: CheckResult[]): { subject: string; html: string } | null {
  const changed = results.filter((r) => r.kind === "changed");
  const errors = results.filter((r) => r.kind === "error");
  if (changed.length + errors.length === 0) return null;

  const li = (r: CheckResult) =>
    `<li>${safeLink(r.sourceUrl, r.brandName)}${r.reason ? ` · ${escapeHtml(r.reason)}` : ""}</li>`;

  const html = [
    changed.length ? `<h2>หน้าโปรเปลี่ยน (เปิดตรวจแล้วกด verify)</h2><ul>${changed.map(li).join("")}</ul>` : "",
    errors.length ? `<h2>ดึงไม่ได้ (เช็คลิงก์)</h2><ul>${errors.map(li).join("")}</ul>` : "",
  ].join("");

  return { subject: `[Kerd] หน้าโปรเปลี่ยน ${changed.length} · ผิดพลาด ${errors.length}`, html };
}
