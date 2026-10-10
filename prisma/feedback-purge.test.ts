import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NOTE_RETENTION_DAYS } from "@/lib/feedback/retention";

// watcher ใช้ role kerd_watcher ที่อ่านข้อมูลผู้ใช้ไม่ได้ (docs/watcher.md ข้อ 4.3)
// จึงลบรายละเอียด 👎 เก่าผ่าน function ใน DB แทนการแตะตาราง PromoFeedback ตรงๆ
const dir = join(__dirname, "migrations");
const sql = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => readFileSync(join(dir, d.name, "migration.sql"), "utf8"))
  .join("\n");
const fn = sql.match(/CREATE (?:OR REPLACE )?FUNCTION public\.purge_old_feedback_notes\(\)[\s\S]*?\$\$;/)?.[0] ?? "";

describe("purge_old_feedback_notes", () => {
  it("มี function ใน migration รันด้วยสิทธิ์เจ้าของ และล็อก search_path", () => {
    expect(fn).toContain("SECURITY DEFINER");
    expect(fn).toMatch(/SET search_path = public, pg_temp/);
  });

  it("ลบแค่ note กับ branch ที่เก่ากว่ากำหนดเดียวกับ lib/feedback/retention.ts", () => {
    expect(fn).toContain(`interval '${NOTE_RETENTION_DAYS} days'`);
    expect(fn).toMatch(/SET note = NULL, branch = NULL/);
    expect(fn).not.toMatch(/DELETE/i);
  });

  it("ไม่ให้ใครเรียกได้ยกเว้น kerd_watcher (ปิด anon/authenticated ของ Supabase Data API)", () => {
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.purge_old_feedback_notes() FROM PUBLIC");
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.purge_old_feedback_notes\(\) FROM anon, authenticated/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.purge_old_feedback_notes\(\) TO kerd_watcher/);
  });

  it("watcher เรียก function แทนการแก้ตาราง PromoFeedback ตรงๆ", () => {
    const watch = readFileSync(join(__dirname, "..", "scripts", "watch.ts"), "utf8");
    expect(watch).not.toContain("prisma.promoFeedback");
    expect(watch).toContain("purge_old_feedback_notes()");
  });
});
