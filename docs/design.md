# HBD Promo: เว็บรวมโปรวันเกิด / เดือนเกิด (Design v1.1)

> "เดือนเกิดนี้ ฉันได้อะไรบ้าง และต้องทำอะไรก่อน?" รวมโปรวันเกิด/เดือนเกิดของร้านอาหาร เครื่องดื่ม บัตรเครดิต แอป และสวัสดิการ พร้อมแหล่งที่มา วิธีใช้สิทธิ์ และวันที่ตรวจล่าสุด

- เจ้าของ: Prapat (ทำคนเดียว) · สรุปจากการ grill 7 พาร์ท วันที่ 7–8 ต.ค. 2026
- ฉบับเก่า: hbd-promo-design-v0.2.md (เก็บใน project files) (มีรายละเอียดทางเลือกที่ไม่ได้เลือก)

---

## 0. หลักการหลัก
1. **ถูกกฎหมาย:** ดึงข้อมูลเฉพาะหน้าเว็บทางการที่เปิดสาธารณะ, เคารพ robots.txt, ไม่ scrape FB/IG/LINE/TikTok/Lemon8, ไม่ผ่านส่วนที่ต้อง login (พ.ร.บ.คอมฯ), เขียนข้อความเอง ไม่ใช้รูป/โลโก้โดยไม่ได้รับอนุญาต (ลิขสิทธิ์), PDPA ครบ, ปรึกษานักกฎหมายก่อนเชิงพาณิชย์
2. **สดทุกวัน:** ระบบตรวจหน้าเว็บทุกวัน คนยืนยันเฉพาะเมื่อเปลี่ยน
3. **ทุกโปรมีแหล่งที่มา + วิธีใช้สิทธิ์ (บังคับ):** `source_url`, ภาพหน้าจอต้นทาง, `how_to_redeem`, เอกสารที่ต้องใช้
4. **แจ้งเตือนสมัครสมาชิกล่วงหน้า:** จุดขายหลัก
5. **ความสดโปร่งใส:** badge "ตรวจล่าสุดเมื่อ..." + 👍/👎 พร้อมเหตุผล
6. **Verified by brand:** badge สำหรับโปรที่แบรนด์ยืนยันเอง (ใช้ในอนาคต)

## 1. ผู้ใช้และ positioning
- **กลุ่มเป้าหมาย:** คนที่ถึงเดือนเกิดแล้วอยากรู้ว่าได้ส่วนลด/ของฟรีอะไรบ้าง
- **ไม่แข่งกับ Lemon8/TikTok:** ใช้เป็นช่องทางพาคนเข้ามา; เราตอบสิ่งที่โพสต์เขาไม่ตอบ คือ "ของฉันใช้อะไรได้ ต้องทำอะไรก่อน ข้อมูลสดไหม"
- **Retention:** LINE OA แจ้งเตือน 2 ครั้ง/ปี
  - ล่วงหน้า 30 วัน: "สมัครสมาชิกพวกนี้ก่อนนะ" (ใช้ `signup_lead_days`)
  - วันที่ 1 ของเดือนเกิด: สรุปโปรที่ใช้ได้
- **Login:** ดูโปรได้โดยไม่ต้อง login; ขอ LINE Login เฉพาะตอนกด "เตือนฉัน"

## 2. การได้มาซึ่งข้อมูล
| ช่วง | วิธี | หมายเหตุ |
|------|------|----------|
| POC | **คัดเอง 30–50 แบรนด์ดัง** | Claude ช่วย draft, Prapat ตรวจยืนยัน |
| POC | **ฟอร์มรับแจ้ง** (ผู้ใช้/แบรนด์) | เข้าคิว ไม่แสดงจนกว่าจะตรวจ |
| POC | **Daily watcher** (hash diff) | เฉพาะหน้าเว็บทางการ |
| POC | **ตรวจด้วยคนทุก 30 วัน** | โปรที่อยู่แค่ในแอป/Facebook (ไม่ scrape, ไม่ใช้ Graph API) |
| ถัดไป | LLM extraction / search | ไม่อยู่ใน POC |
| ถัดไป | Brand portal (self-submit) | ไม่อยู่ใน POC |

**แหล่ง seed:** หน้า membership ทางการ (Starbucks, Café Amazon, MK, Swensen's, After You, KFC, Major/SF ฯลฯ), หน้าโปรบัตรเครดิต (KTC, SCB, KBank, UOB ฯลฯ), แอป (ALL Member, The 1, LINE MAN ฯลฯ), สวัสดิการรัฐ. บทความ/Lemon8 ใช้เป็นลีดเท่านั้น

**แบรนด์ขอลบ:** ซ่อนภายใน 48 ชม. → ลบตามคำขอ → เสนอการร่วมงาน

## 3. ความสดของข้อมูล
```
GitHub Actions (ทุกวัน)
  → fetch source_url (เฉพาะ verify_method = auto) → normalize text → sha256
  → hash เปลี่ยน? → บันทึก source_snapshots(diff_detected = true)
  → สรุป diff + report ใหม่ → email Prapat (Resend)
Prapat เปิดหน้าต้นทาง → แก้ใน Supabase Studio → verify → revalidateTag("promos")
```
- `verify_method = manual` (แอป/Facebook): ถึงกำหนด 30 วันแล้วยังไม่ตรวจ → ป้ายเหลือง
- 👎 ต้องเลือกเหตุผล: ข้อมูลผิด / หน้าร้านไม่ให้ใช้สิทธิ์ / โปรหมดแล้ว / อื่นๆ + ช่องอธิบาย
- ทุก report ส่ง email ทันที; ครบ 7 ครั้งใน 7 วัน → ป้าย ⚠️ + เข้าคิว (ไม่ซ่อนอัตโนมัติ)
- ทุกการ์ด: "เพื่อความถูกต้อง กรุณาตรวจสอบสิทธิ์ที่ต้นทางอีกครั้ง" + ปุ่มไป `source_url`

## 4. Data model (Supabase Postgres / Prisma)

ตารางด้านล่างเป็นภาพรวม ตอนเขียนโค้ดจะแปลงเป็น `prisma/schema.prisma` (ตัวอย่าง model หลักอยู่ในข้อ 5)
```sql
brands (
  id uuid pk, name text, slug text unique,
  category text,                 -- food | drink | beauty | bank | entertainment | gov | app
  website_url text, created_at timestamptz
)

promotions (
  id uuid pk, brand_id uuid fk,
  title text, benefit text,
  benefit_type text,             -- free_item | discount_percent | discount_amount | points | free_entry | other
  window text,                   -- day | week | month
  window_days_before int default 0, window_days_after int default 0,
  tiers jsonb,                   -- [{tier: "Gold", benefit: "...", conditions: ["..."]}] แสดงในการ์ดเดียว
  requires_membership bool, membership_name text,
  signup_lead_days int default 0,
  min_spend numeric null, conditions text[], channels text[],  -- in_store | online | app
  excluded_branches text,
  source_url text not null, source_snapshot_url text,
  how_to_redeem text[] not null, required_docs text[],
  verify_method text,            -- auto | manual
  brand_verified bool default false,
  status text,                   -- draft | published | hidden | expired
  last_verified_at timestamptz, created_at, updated_at
)

promotion_revisions (id, promotion_id fk, snapshot jsonb, changed_by text, created_at)
source_snapshots    (id, promotion_id fk, content_hash text, diff_detected bool, fetched_at)
promo_feedback      (id, promotion_id fk, user_id null, still_valid bool,
                     reason text,  -- wrong_info | store_refused | expired | other
                     note text, branch text null, created_at)
submissions         (id, payload jsonb, source_url text, status text, created_at)

users        (id, line_user_id text unique, birth_month int, birth_day int null, created_at)  -- ไม่เก็บปีเกิด/เบอร์โทร
consent_logs (id, user_id fk, purpose text, granted bool, version text, created_at)          -- purpose: marketing_line ฯลฯ
```

## 5. Tech stack (v1.1: เปลี่ยน ORM เป็น Prisma)
| ชั้น | เลือก | หมายเหตุ |
|------|-------|----------|
| Framework | **Next.js App Router + TypeScript** | SSG + `revalidateTag("promos")` ตอนยืนยันโปร, Server Actions |
| UI | Tailwind CSS + shadcn/ui | |
| Validation | **Zod** | ตรวจทุกขอบเขต: form, Server Action, ไฟล์ seed JSON, response จากหน้าเว็บที่ watcher ดึง |
| ORM | **Prisma (v7)** + `@prisma/adapter-pg` | `prisma.config.ts`, migration ผ่าน `DIRECT_URL` |
| Database | **Supabase Postgres** (region สิงคโปร์) | runtime ใช้ transaction pooler (port 6543), migration ใช้ direct (5432) |
| Storage | Supabase Storage | ภาพหน้าจอต้นทาง |
| Auth | **Auth.js** (LINE provider) + `@auth/prisma-adapter` | เก็บ session/user ใน Postgres เดียวกัน |
| Watcher | GitHub Actions schedule (รายวัน) | |
| Email | Resend | สรุปรายวันถึง Prapat |
| แจ้งเตือนผู้ใช้ | LINE Messaging API (LINE OA) | |
| Test | **Vitest (TDD เสมอ)** + Testing Library, Playwright (e2e) | |
| Dev tooling | **Supabase MCP** ใน Claude Code | ดูข้อ 5.3 |
| Hosting | Vercel Hobby (region สิงคโปร์) | ช่วง POC ที่ไม่มีรายได้ |

### 5.1 Prisma + Supabase setup
```text
# .env
DATABASE_URL="postgres://USER:PASS@<pooler-host>:6543/postgres?pgbouncer=true"   # runtime
DIRECT_URL="postgres://USER:PASS@db.<project-ref>.supabase.co:5432/postgres"     # prisma migrate
```
```ts
// prisma.config.ts
import { defineConfig, env } from "prisma/config";
export default defineConfig({ schema: "prisma/schema.prisma", datasource: { url: env("DIRECT_URL") } });

// lib/db.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
```
```prisma
// prisma/schema.prisma (ตัวอย่าง model หลัก)
model Brand {
  id         String      @id @default(uuid())
  name       String
  slug       String      @unique
  category   String
  websiteUrl String?
  promotions Promotion[]
}

model Promotion {
  id               String    @id @default(uuid())
  brand            Brand     @relation(fields: [brandId], references: [id])
  brandId          String
  title            String
  benefit          String
  benefitType      String
  window           String    // day | week | month
  windowDaysBefore Int       @default(0)
  windowDaysAfter  Int       @default(0)
  tiers            Json?
  signupLeadDays   Int       @default(0)
  howToRedeem      String[]
  requiredDocs     String[]
  sourceUrl        String
  verifyMethod     String    // auto | manual
  status           String    @default("draft")
  lastVerifiedAt   DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```
⚠️ ตามเอกสาร Prisma ยังไม่ชัดว่า `pgbouncer=true` จำเป็นกับ `adapter-pg` หรือไม่ ให้ทดสอบตอน scaffold ([Prisma + Supabase](https://prisma.io/docs/guides/database/supabase))

**Zod คู่กับ Prisma:** Prisma ให้ type ฝั่ง DB อยู่แล้ว ส่วน Zod ใช้ตรวจข้อมูลที่เข้ามาจากภายนอก เช่น
```ts
// lib/schemas/promotion.ts
export const PromotionInput = z.object({
  brandSlug: z.string().min(1),
  title: z.string().min(1),
  window: z.enum(["day", "week", "month"]),
  sourceUrl: z.string().url(),                        // หลักการ 3: บังคับ
  howToRedeem: z.array(z.string().min(1)).min(1),      // หลักการ 3: บังคับ
  signupLeadDays: z.number().int().min(0).default(0),
});
```

### 5.2 TDD ด้วย Vitest (กติกาของโปรเจกต์)
ทุก feature เริ่มจาก test ก่อนเสมอ: **Red → Green → Refactor**
1. เขียน test ที่ fail (`vitest --watch`)
2. เขียนโค้ดน้อยที่สุดให้ผ่าน
3. Refactor โดยที่ test ยังเขียว
- Unit: logic ล้วนใน `lib/` (eligibility, reminder dates, freshness, downvote rule, Zod schemas)
- Integration: Prisma กับ Postgres ทดสอบ (Supabase local ผ่าน `supabase start` หรือ branch แยก) ห้ามยิง DB จริง
- Component: Testing Library; e2e: Playwright เฉพาะ flow หลัก (เลือกเดือน → ดูโปร → กดเตือนฉัน)
- CI: GitHub Actions รัน `vitest run` ทุก PR

```ts
// lib/eligibility.ts — รองรับวันเกิดข้ามปี (เช่น เกิด 31 ธ.ค. โปร ±7 วัน)
export function isEligible(p: Promo, birth: { month: number; day?: number }, today = new Date()) {
  if (p.window === "month") return today.getMonth() + 1 === birth.month;
  if (!birth.day) return false;
  const [before, after] = p.window === "week" ? [3, 3] : [p.windowDaysBefore, p.windowDaysAfter];
  const y = today.getFullYear();
  return [y - 1, y, y + 1].some((yr) => {
    const bday = new Date(yr, birth.month - 1, birth.day!);
    const diff = Math.round((today.getTime() - bday.getTime()) / 86_400_000);
    return diff >= -before && diff <= after;
  });
}

// lib/eligibility.test.ts (เขียนก่อน isEligible)
import { it, expect } from "vitest";
it("โปรรายเดือนใช้ได้ทั้งเดือน", () => {
  expect(isEligible({ window: "month" } as Promo, { month: 10 }, new Date("2026-10-31"))).toBe(true);
});
it("เกิด 31 ธ.ค. โปร +7 วัน ยังใช้ได้ 3 ม.ค.", () => {
  const p = { window: "day", windowDaysBefore: 0, windowDaysAfter: 7 } as Promo;
  expect(isEligible(p, { month: 12, day: 31 }, new Date(2027, 0, 3))).toBe(true);
});
```

### 5.3 ติดตั้ง Supabase MCP ใน Claude Code
ใช้ให้ Claude อ่าน schema, รัน SQL, ดู log, สร้าง migration ได้จากใน Claude Code ([Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp))
```bash
# ในโฟลเดอร์ repo (scope = project → เขียนลง .mcp.json)
claude mcp add --scope project --transport http supabase \
  "https://mcp.supabase.com/mcp?project_ref=<PROJECT_REF>&features=docs%2Cdatabase%2Cdebugging%2Cdevelopment"
```
จากนั้นเปิด terminal ปกติ รัน `claude` แล้วพิมพ์ `/mcp` → เลือก supabase → Authenticate (login ผ่าน browser ไม่ต้องใช้ token)

กติกาความปลอดภัย:
- ใส่ `project_ref` เสมอ (จำกัดให้เห็นแค่โปรเจกต์นี้)
- ต่อกับ **dev project** เท่านั้น; ถ้าต้องดู production ให้เพิ่ม `&read_only=true`
- เปิดเฉพาะ feature ที่ใช้ (ด้านบนไม่เปิด account/functions/branching/storage)
- อย่ากดอนุมัติ `execute_sql` / `apply_migration` โดยไม่อ่าน เพราะข้อมูลในตารางอาจมี prompt injection
- migration หลักยังทำผ่าน `prisma migrate` เพื่อไม่ให้ schema สองที่ไม่ตรงกัน; ใช้ MCP เพื่ออ่านและ debug

## 6. PDPA และกฎหมาย (ตรวจด้วย skill `thai-pdpa-review`)
- ข้อมูลส่วนบุคคลขั้นต่ำ: LINE userId, เดือน/วันเกิด, consent log
- consent แยกสำหรับข้อความการตลาด, เลิกรับได้ (block OA = ถอน consent), ปุ่มลบบัญชี
- ส่งข้อมูลออกนอกประเทศ (ม.28–29, ประกาศ PDPC มีผล 24 มี.ค. 2024): region สิงคโปร์ + DPA/SCC ของ vendor, ระบุ vendor + ประเทศใน privacy notice
  - ⚠️ ให้นักกฎหมายยืนยันว่า EU SCC ใน DPA ของ Supabase/Vercel นับเป็น "Overseas Model" ได้ไหม; DPA ของ Vercel ยังไม่ได้ตรวจ
- ไม่ส่งข้อมูลผู้ใช้เข้า LLM
- Cookie banner ถ้าใช้ analytics ที่ไม่จำเป็น

## 7. POC scope
**ทำ:** หน้าเลือกเดือน → list โปร, filter (หมวด/ต้องสมัครไหม/ช่องทาง), `/brand/[slug]`, หน้า "โปรวันเกิด [เดือน]" 12 หน้า (SEO), 👎 + feedback, ฟอร์มแจ้งโปร (เข้าคิว), LINE Login + เตือนฉัน, LINE OA แจ้งเตือน 2 ครั้ง/ปี, daily watcher + email digest, privacy notice + consent

**ไม่ทำ:** brand portal, แผนที่สาขา, email ฝั่งผู้ใช้, SMS, แสดงโปรจากผู้ใช้, LLM ทุกรูปแบบ, โฆษณา

**ตัวชี้วัด POC (3 เดือน):** ดูแลข้อมูลคนเดียว ≤2 ชม./สัปดาห์, โปรที่ตรวจภายใน 30 วัน ≥90% (ไม่ตั้งเป้าจำนวนผู้ใช้)

**Growth:** SEO + คอนเทนต์ที่คนเข้าถึง; โพสต์ Lemon8/TikTok จาก account เราเดือนละครั้ง (ใช้ skill marketing)

## 8. รายได้ (อนาคต ยังไม่ทำใน POC)
ลำดับที่วางไว้: ① affiliate (บัตรเครดิต/แอป, ติดป้ายชัด) → ② featured listing → ③ brand portal แบบสมาชิก. ไม่ติดโฆษณา (AdSense)
- เมื่อเริ่มมีรายได้ ต้องย้าย Vercel เป็น Pro (Hobby ใช้ได้เฉพาะงานไม่ใช่เชิงพาณิชย์)

## 9. ความเสี่ยง
| ความเสี่ยง | รับมือ |
|------------|--------|
| ข้อมูลเก่า → เสียความเชื่อใจ | watcher รายวัน, manual 30 วัน, badge ความสด, feedback + เหตุผล |
| ทำคนเดียวไม่ไหว | เริ่ม 30–50 แบรนด์, วัดชั่วโมงดูแลต่อสัปดาห์ |
| ToS / ลิขสิทธิ์ | ไม่ scrape social, เขียนเอง, ลิงก์ต้นทาง, takedown 48 ชม. |
| PDPA | ข้อมูลขั้นต่ำ, consent log, region สิงคโปร์, ปรึกษานักกฎหมาย |

## 10. แผนขั้นต่อไป (8 ต.ค. 2026)
**Sprint 0 · Setup (Prapat)**: Gmail โปรเจกต์ + 2FA, GitHub repo ว่าง (เชื่อมกับ project), Supabase dev project (สิงคโปร์), Vercel, LINE Developers (Login channel + Messaging API/OA)
**Sprint 1 · Foundation (TDD)**: scaffold Next.js + Vitest + Prisma + Zod + CI; schema รวมผล POC (`valid_until`, `required_tier`); test-first: `isEligible`, Zod schemas; script import `poc-brands.json` (ข้าม Starbucks placeholder)
**Sprint 2 · หน้าเว็บ**: เลือกเดือน → list, `/brand/[slug]`, 12 หน้า "โปรวันเกิด [เดือน]", การ์ดพร้อม badge ความสด + disclaimer, 👎 พร้อมเหตุผล
**Sprint 3 · Data ops**: GitHub Actions watcher (hash) + link checker + Resend digest; ขยายข้อมูล 10 → 30–50 แบรนด์ (ทำคู่ขนาน)
**Sprint 4 · LINE + PDPA**: Auth.js LINE Login, consent log, reminder 2 ครั้ง/ปี, privacy notice, รัน thai-pdpa-review
**ก่อนเปิดสาธารณะ**: นักกฎหมายตรวจ cross-border/SCC + privacy notice

## ภาคผนวก: สำรวจตลาด (7 ต.ค. 2026)
- **ไทย:** ไม่พบ product โดยตรง มีแต่คอนเทนต์ครั้งเดียว (Lemon8, Shopee Blog, CheckRaka, Marketeer, KTC) ที่ค้นตามเดือนไม่ได้ ไม่บอกความสด ไม่แจ้งเตือน
- **ต่างประเทศ:** Freebie-Depot / Free BDay (500+ โปร คัดเอง, list ถูก pin 140,000+ ครั้ง), BirthdayComp.com
- ข้อจำกัด: สำรวจจาก web search ไม่ได้ไล่ App Store/Play Store ไทยครบ

## ภาคผนวก: ผล POC เก็บข้อมูล 10 แบรนด์ (8 ต.ค. 2026)
ข้อมูล: [data/poc-brands.json](data/poc-brands.json), สรุป: [data/poc-brands-notes.md](data/poc-brands-notes.md)
- ยืนยันได้จากหน้าเว็บทางการ (auto) 5/10, มีหน้าทางการแต่รายละเอียดอยู่ในแอป (manual) 3/10, หาไม่เจอหรือถูกบล็อก 2/10 (Starbucks 403, After You ต้องใช้ JavaScript)
- เฉลี่ย ~5 tool calls ต่อแบรนด์ (ง่าย 3, ยาก 6–8)
- สิ่งที่ต้องเพิ่มในแบบ: `valid_from` / `valid_until` (ผลค้นหาเต็มไปด้วยแคมเปญหมดอายุ), link checker (URL ย้ายบ่อย), `required_tier` + `tier_requirement` แทนการเดาจำนวนวันสมัครล่วงหน้า, watcher ต้องรองรับหน้าที่ใช้ JavaScript (headless browser) หรือใช้ manual
