import { createHash } from "node:crypto";

const DROP_BLOCKS = /<(script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * แปลง HTML เป็นข้อความล้วนเพื่อใช้ทำ hash เท่านั้น
 * ห้ามนำผลไป render หรือส่งต่อเป็น HTML (เป็นข้อมูลไม่น่าเชื่อถือจากภายนอก)
 */
export function pageToText(html: string): string {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(DROP_BLOCKS, " ")
    .replace(/<[^>]*>/g, " ");
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

export function contentHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
