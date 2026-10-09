import { describe, expect, it } from "vitest";
import { renderSubmissionEmail } from "./email";

describe("renderSubmissionEmail", () => {
  it("escape ทุกช่อง มีลิงก์ต้นทาง และเตือนให้ตรวจก่อนเผยแพร่", () => {
    const { subject, html } = renderSubmissionEmail({
      brandName: "A&B",
      sourceUrl: "https://a.example/promo?x=1&y=2",
      benefit: "<b>ฟรี</b>",
      howToRedeem: null,
    });
    expect(subject).toBe("[Kerd] มีคนแจ้งโปรใหม่: A&B");
    expect(html).toContain("A&amp;B");
    expect(html).toContain("&lt;b&gt;ฟรี&lt;/b&gt;");
    expect(html).toContain('<a href="https://a.example/promo?x=1&amp;y=2">');
    expect(html).toContain("<dd>-</dd>");
    expect(html).toContain("ตรวจที่หน้าเว็บทางการ");
  });
});
