import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCandidates } from "./candidates";

const csv = readFileSync(join(process.cwd(), "docs/data/brand-candidates.csv"), "utf8");
const poc: { slug: string }[] = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("parseCandidates", () => {
  it("อ่านแถวและแยกคอลัมน์", () => {
    const rows = parseCandidates("slug,name,category,website,status,note\nbonchon,Bonchon,food,https://www.bonchon.co.th,todo,\n");
    expect(rows).toEqual([
      { slug: "bonchon", name: "Bonchon", category: "food", website: "https://www.bonchon.co.th", status: "todo", note: "" },
    ]);
  });

  it.each([
    ["หมวดไม่รู้จัก", "x,X,shoes,https://x.com,todo,"],
    ["ไม่ใช่ https", "x,X,food,http://x.com,todo,"],
    ["slug ไม่ใช่ kebab-case", "X Y,X,food,https://x.com,todo,"],
    ["เว็บโซเชียลที่ห้าม scrape", "x,X,food,https://www.facebook.com/x,todo,"],
    ["คอลัมน์ไม่ครบ", "x,X,food"],
  ])("ปฏิเสธ: %s", (_label, row) => {
    expect(() => parseCandidates(`slug,name,category,website,status,note\n${row}\n`)).toThrow();
  });

  it("ปฏิเสธ slug ซ้ำ", () => {
    const row = "x,X,food,https://x.com,todo,";
    expect(() => parseCandidates(`slug,name,category,website,status,note\n${row}\n${row}\n`)).toThrow(/duplicate/);
  });
});

describe("docs/data/brand-candidates.csv", () => {
  const rows = parseCandidates(csv);

  it("มีอย่างน้อย 100 แบรนด์", () => {
    expect(rows.length).toBeGreaterThanOrEqual(100);
  });

  it("ทุกหมวดมีอย่างน้อย 5 แบรนด์", () => {
    const counts = Object.groupBy(rows, (r) => r.category);
    for (const [cat, list] of Object.entries(counts)) expect(list!.length, cat).toBeGreaterThanOrEqual(5);
  });

  it("แบรนด์ใน POC ถูกติดสถานะ poc และมีครบทุกตัว", () => {
    const pocSlugs = poc.map((b) => b.slug).sort();
    expect(rows.filter((r) => r.status === "poc").map((r) => r.slug).sort()).toEqual(pocSlugs);
  });
});
