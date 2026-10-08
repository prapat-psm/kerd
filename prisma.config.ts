import "dotenv/config";
import { defineConfig } from "prisma/config";

// CLI (migrate/introspect) ใช้ direct connection; runtime ใช้ DATABASE_URL ผ่าน adapter ใน lib/db.ts
// ไม่ใช้ env() แบบบังคับ เพื่อให้ `prisma generate` รันได้ใน CI/Vercel โดยไม่ต้องมี DB
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DIRECT_URL ?? "" },
});
