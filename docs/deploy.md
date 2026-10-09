# Deploy (CI/CD)

```
PR → CI (lint, typecheck, unit + coverage, build, e2e) → merge → CI บน main ผ่าน → Deploy → Vercel production
```

- **CI** (`.github/workflows/ci.yml`): ESLint ห้ามมี warning, coverage ต้องไม่ต่ำกว่าเกณฑ์ใน `vitest.config.mts`
  (functions 95%, lines/statements 90%, branches 85%) ดูตัวเลขได้ใน Summary ของ run และ artifact `coverage`
- **Deploy** (`.github/workflows/deploy.yml`): รันเมื่อ CI บน `main` ผ่านเท่านั้น, deploy commit เดียวกับที่ CI ตรวจ,
  รัน `prisma migrate deploy` และ `npm run db:seed` (นำเข้าโปรจาก `docs/data/poc-brands.json`) ก่อน แล้ว `vercel deploy --prod` (build บน Vercel เพื่อใช้ env แบบ Sensitive ได้) และ smoke test
- `vercel.json` ปิด auto deploy ของ `main` จาก Vercel เอง (preview ของ PR ยังทำงานตามเดิม) และตั้ง region `sin1`
- deploy ซ้ำด้วยมือ: Actions → Deploy → Run workflow
- rollback: Vercel dashboard → Deployments → เลือกรุ่นก่อนหน้า → Instant Rollback

## ตั้งค่าครั้งแรก (ทำบนเครื่อง/เว็บของเจ้าของโปรเจกต์)

1. Vercel → Account Settings → Tokens → สร้าง token ชื่อ `github-actions-kerd`
2. ในโฟลเดอร์โปรเจกต์รัน `npx vercel link` แล้วเปิด `.vercel/project.json` เอา `orgId` และ `projectId`
3. GitHub → Settings → Environments → New environment ชื่อ `production`
   - Deployment branches: `main` อย่างเดียว
   - Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DIRECT_URL` (session pooler 5432)
   - Variables: `PRODUCTION_URL` (เช่น `https://kerd.app` หรือโดเมน `.vercel.app` ของ production)
   - ถ้าอยากกดอนุมัติก่อนทุก deploy ให้เปิด Required reviewers
4. Vercel → Project → Settings → Environment Variables (Production): `DATABASE_URL` (pooler 6543)

ห้ามใส่ค่า secret ลงในไฟล์ใน repo หรือในแชต
