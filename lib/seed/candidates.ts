import { z } from "zod";

export const CATEGORIES = ["food", "drink", "beauty", "retail", "bank", "entertainment", "app", "gov"] as const;
const BANNED_HOSTS = /(^|\.)(facebook\.com|fb\.com|instagram\.com|line\.me|tiktok\.com|lemon8-app\.com)$/i;

const Candidate = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  website: z
    .url({ protocol: /^https$/ })
    .refine((u) => !BANNED_HOSTS.test(new URL(u).hostname), "ห้ามใช้เว็บโซเชียลเป็นแหล่งข้อมูล"),
  // poc = มีข้อมูลใน poc-brands.json แล้ว, todo = ยังไม่ได้ research, skip = ตรวจแล้วไม่มีโปรวันเกิด
  status: z.enum(["poc", "todo", "skip"]),
  note: z.string(),
});
export type Candidate = z.infer<typeof Candidate>;

const COLUMNS = ["slug", "name", "category", "website", "status", "note"] as const;

/** อ่าน CSV รายชื่อแบรนด์เป้าหมาย (ห้ามมี comma ในค่า) และตรวจด้วย Zod */
export function parseCandidates(csv: string): Candidate[] {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  if (header !== COLUMNS.join(",")) throw new Error(`header must be: ${COLUMNS.join(",")}`);

  const seen = new Set<string>();
  return lines.map((line, i) => {
    const cells = line.split(",");
    if (cells.length !== COLUMNS.length) throw new Error(`line ${i + 2}: expected ${COLUMNS.length} columns`);
    const row = Candidate.parse(Object.fromEntries(COLUMNS.map((c, j) => [c, cells[j].trim()])));
    if (seen.has(row.slug)) throw new Error(`line ${i + 2}: duplicate slug ${row.slug}`);
    seen.add(row.slug);
    return row;
  });
}
