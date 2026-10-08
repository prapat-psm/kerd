# Kerd · เกิด

เว็บรวมโปรวันเกิด/เดือนเกิดในไทย พร้อมแหล่งที่มา วิธีใช้สิทธิ์ และวันที่ตรวจล่าสุด
Design: `docs/design.md` · Branding: `docs/branding.md` · ข้อมูล POC: `docs/data/`

## Stack
Next.js App Router + TypeScript · Tailwind + shadcn/ui · Prisma v7 (`@prisma/adapter-pg`) · Supabase Postgres (region สิงคโปร์) · Zod · Auth.js (LINE) · Vitest + Testing Library · Playwright · GitHub Actions · Resend · LINE Messaging API · Vercel

## กติกาการทำงาน
- **TDD เสมอ (Vitest):** เขียน test ที่ fail ก่อน → โค้ดน้อยที่สุดให้ผ่าน → refactor ห้าม skip/disable test เพื่อให้ผ่าน
- Logic ล้วนอยู่ใน `lib/` และมี unit test; integration test ใช้ Supabase local หรือ branch แยก ห้ามยิง DB จริง
- Zod ตรวจข้อมูลทุกจุดที่เข้ามาจากภายนอก (form, Server Action, seed JSON, หน้าเว็บที่ watcher ดึง)
- Prisma: runtime ใช้ `DATABASE_URL` (pooler 6543), migration ใช้ `DIRECT_URL` (5432) ผ่าน `prisma migrate` เท่านั้น
- ห้าม commit secret (`.env*` ต้องอยู่ใน `.gitignore`)

## กติกาข้อมูล (ห้ามละเมิด)
- ทุกโปรต้องมี `sourceUrl` (หน้าเว็บทางการ) และ `howToRedeem` อย่างน้อย 1 ขั้น
- ดึงข้อมูลจากหน้าเว็บทางการที่เปิดสาธารณะเท่านั้น เคารพ robots.txt ห้าม scrape Facebook/Instagram/LINE/TikTok/Lemon8 ห้ามผ่านส่วนที่ต้อง login
- เขียนคำอธิบายเอง ห้ามคัดลอกข้อความยาว/รูป/โลโก้ของแบรนด์
- ทุกการ์ดโปรแสดง "ตรวจล่าสุดเมื่อ..." และลิงก์ให้ผู้ใช้ตรวจสิทธิ์ที่ต้นทาง

## PDPA
- เก็บข้อมูลส่วนบุคคลขั้นต่ำ: LINE userId, เดือน/วันเกิด (ไม่เก็บปีเกิด/เบอร์โทร), consent log
- consent สำหรับข้อความการตลาดแยกต่างหาก ถอนได้; ไม่ส่งข้อมูลผู้ใช้เข้า LLM
- ฟีเจอร์ที่แตะข้อมูลผู้ใช้หรือการเก็บข้อมูลจากภายนอก ให้รัน skill `thai-pdpa-review` ก่อน merge

## Claude tooling
- Plugin: superpowers (ประกาศใน `.claude/settings.json`) ใช้ brainstorming → writing-plans → test-driven-development
- Project skills: `thai-pdpa-review`, `hbd-marketing-pulse` ใน `.claude/skills/`
- Supabase MCP: ดู `docs/design.md` ข้อ 5.3 (ต่อ dev project เท่านั้น, ใส่ `project_ref`)
