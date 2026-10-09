import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { buildPocSeed } from "../lib/seed/build";

// รันซ้ำได้: upsert แบรนด์ด้วย slug และ 1 แบรนด์มี 1 โปร (อัปเดตถ้ามีอยู่แล้ว)
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));
  const { rows, skipped } = buildPocSeed(raw);

  for (const { brand, promotion } of rows) {
    const b = await prisma.brand.upsert({ where: { slug: brand.slug }, create: brand, update: brand });
    const existing = await prisma.promotion.findFirst({ where: { brandId: b.id }, select: { id: true } });
    // รันซ้ำไม่ดึงโปรที่คนเผยแพร่เองใน Studio กลับเป็น draft
    const data =
      promotion.status === "published"
        ? promotion
        : Object.fromEntries(Object.entries(promotion).filter(([k]) => k !== "status" && k !== "lastVerifiedAt"));
    if (existing) await prisma.promotion.update({ where: { id: existing.id }, data });
    else await prisma.promotion.create({ data: { ...promotion, brandId: b.id } });
    console.log(`✓ ${brand.slug}`);
  }
  for (const s of skipped) console.log(`- skip ${s.slug}: ${s.reason}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
