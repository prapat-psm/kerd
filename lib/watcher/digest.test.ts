import { describe, expect, it } from "vitest";
import { escapeHtml, renderDigest } from "./digest";
import type { CheckResult } from "./types";

const base = { promotionId: "p1", brandName: "Sizzler", sourceUrl: "https://www.sizzler.co.th/faq" };

describe("escapeHtml", () => {
  it("escape อักขระอันตราย", () => {
    expect(escapeHtml(`<img src=x onerror="a">&'`)).toBe("&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
  });
});

describe("renderDigest", () => {
  it("คืน null เมื่อไม่มีอะไรต้องให้คนดู", () => {
    expect(renderDigest([{ ...base, kind: "unchanged" }])).toBeNull();
  });

  it("รวมรายการเปลี่ยน/ผิดพลาด และ escape ชื่อแบรนด์จาก DB", () => {
    const results: CheckResult[] = [
      { ...base, kind: "changed" },
      { ...base, promotionId: "p2", brandName: "<script>x</script>", kind: "error", reason: "http_404" },
      { ...base, promotionId: "p3", kind: "unchanged" },
    ];
    const d = renderDigest(results)!;
    expect(d.subject).toBe("[Kerd] หน้าโปรเปลี่ยน 1 · ผิดพลาด 1");
    expect(d.html).toContain("Sizzler");
    expect(d.html).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(d.html).not.toContain("<script>");
    expect(d.html).toContain("http_404");
  });

  it("ไม่ใส่ลิงก์ที่ไม่ใช่ https", () => {
    const d = renderDigest([{ ...base, sourceUrl: "javascript:alert(1)", kind: "changed" }])!;
    expect(d.html).not.toContain("javascript:");
  });
});
