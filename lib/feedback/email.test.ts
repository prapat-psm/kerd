import { describe, expect, it } from "vitest";
import { renderFeedbackEmail } from "./email";

const base = {
  brandName: "MK",
  title: "ของขวัญวันเกิด",
  sourceUrl: "https://mk.example/promo",
  reason: "store_refused" as const,
  note: null,
  branch: null,
  downvotes: 2,
};

describe("renderFeedbackEmail", () => {
  it("หัวเรื่องบอกแบรนด์ เหตุผล และจำนวนเทียบเกณฑ์", () => {
    expect(renderFeedbackEmail(base).subject).toBe("[Kerd] 👎 MK: หน้าร้านไม่ให้ใช้สิทธิ์ (2/7 ใน 7 วัน)");
  });

  it("ครบเกณฑ์ บอกว่าขึ้นป้าย ⚠️ แล้ว", () => {
    expect(renderFeedbackEmail({ ...base, downvotes: 7 }).html).toContain("ขึ้นป้าย ⚠️ แล้ว");
    expect(renderFeedbackEmail(base).html).not.toContain("ขึ้นป้าย");
  });

  it("escape ข้อความจากผู้ใช้ทุกช่อง และมีลิงก์ต้นทาง", () => {
    const { html, subject } = renderFeedbackEmail({ ...base, brandName: "A&B", note: "<script>x</script>", branch: '"สยาม"' });
    expect(html).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(html).toContain("&quot;สยาม&quot;");
    expect(html).toContain("A&amp;B");
    expect(html).toContain('<a href="https://mk.example/promo">');
    expect(subject).toContain("A&B");
  });

  it("ไม่มีรายละเอียด/สาขา แสดงขีด", () => {
    expect(renderFeedbackEmail(base).html).toContain("<dd>-</dd>");
  });
});
