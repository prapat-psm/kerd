import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Supabase เปิด schema public ผ่าน Data API ด้วย anon key
// ทุกตารางต้องเปิด RLS (ไม่มี policy = ปิดทาง API) ส่วน Prisma ต่อด้วย role postgres จึงไม่โดนบล็อก
const dir = join(__dirname, "migrations");
const sql = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => readFileSync(join(dir, d.name, "migration.sql"), "utf8"))
  .join("\n");

const created = [...sql.matchAll(/CREATE TABLE "(\w+)"/g)].map((m) => m[1]);
const rls = new Set([...sql.matchAll(/ALTER TABLE "(\w+)" ENABLE ROW LEVEL SECURITY/g)].map((m) => m[1]));

describe("migrations", () => {
  it("มีตารางใน migration", () => {
    expect(created.length).toBeGreaterThan(0);
  });

  it.each(created)("ตาราง %s เปิด RLS", (table) => {
    expect(rls.has(table)).toBe(true);
  });
});
