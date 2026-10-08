# Watcher: sync หน้าโปรวันเกิดวันละหลายรอบ

สถานะ: skeleton (POC) · อ้างอิง `docs/design.md` ข้อ 2–3

## 1. ภาพรวม
```
GitHub Actions cron (06:00 / 12:00 / 18:00 เวลาไทย)
  → scripts/watch.ts
      1. โหลดโปร verify_method=auto (draft/published) + hash ล่าสุด      [Prisma]
      2. ต่อแบรนด์: ตรวจ URL (allowlist, https) → อ่าน robots.txt        [url-guard, robots]
      3. DNS lookup → ห้าม IP ภายใน → fetch (timeout, ≤2MB, redirect ≤3)  [fetch-source]
      4. HTML → ข้อความล้วน → sha256                                       [normalize]
      5. เทียบ hash เดิม → baseline / unchanged / changed / error          [run]
      6. INSERT source_snapshots เท่านั้น (ไม่แตะ promotion)
  → มีรายการ changed/error → email digest ถึง Prapat (Resend)              [digest]
Prapat เปิดหน้าต้นทาง → แก้ใน Supabase Studio → verify (lastVerifiedAt) → revalidateTag
```
**กติกาที่ไม่เปลี่ยน:** watcher ไม่แก้ข้อมูลโปรและไม่ publish เอง ทุกการเปลี่ยนแปลงต้องให้คน verify

## 2. ต้องใช้อะไรบ้าง
| อย่าง | ใช้ทำอะไร | สถานะ |
|---|---|---|
| GitHub Actions (`.github/workflows/watch.yml`) | ตั้งเวลา + รัน script | มีแล้ว |
| GitHub Environment `watcher` + secrets | เก็บ `WATCHER_DATABASE_URL`, `RESEND_API_KEY`, `DIGEST_TO`, `DIGEST_FROM` | Prapat ต้องตั้ง |
| Supabase Postgres | อ่านโปร / เขียน `source_snapshots` | มีแล้ว |
| Resend | ส่ง email digest | Prapat ต้องสมัคร + verify domain |
| `lib/watcher/*` | logic ล้วน มี unit test ครบ | มีแล้ว |
| Postgres role `kerd_watcher` | สิทธิ์ต่ำสุด (ข้อ 4) | แนะนำ ทำก่อนเปิด cron |

ไม่ต้องลง package ใหม่: ใช้ `fetch`, `node:dns`, `node:crypto` ของ Node 22

## 3. ไฟล์และหน้าที่
| ไฟล์ | หน้าที่ |
|---|---|
| `lib/watcher/allowed-hosts.ts` | host ที่ยิงได้ แก้ผ่าน PR เท่านั้น (ไม่อ่านจาก DB) |
| `lib/watcher/url-guard.ts` | `checkSourceUrl` (https, ไม่มี user:pass, ไม่มี port, ไม่ใช่ IP, host ใน allowlist) + `isPrivateAddress` |
| `lib/watcher/robots.ts` | `robotsAllows` ตาม RFC 9309 แบบย่อ |
| `lib/watcher/fetch-source.ts` | ดึงหน้าแบบปลอดภัย: DNS → กัน IP ภายใน → redirect manual ≤3 (ตรวจซ้ำทุก hop) → timeout → content-type → จำกัดขนาด |
| `lib/watcher/normalize.ts` | `pageToText` (ตัด script/style/comment/tag) + `contentHash` |
| `lib/watcher/run.ts` | orchestration แบบ inject dependency, แบรนด์เดียวพังไม่ล้มทั้งรอบ, เว้น 3 วิระหว่าง request |
| `lib/watcher/digest.ts` | สร้าง email; escape ทุกค่า, ลิงก์เฉพาะ https |
| `scripts/watch.ts` | ต่อสายจริง: Prisma + DNS + fetch + Resend, Zod ตรวจ env |

ตัวอย่างการใช้ (ทุกอย่าง inject ได้ จึง test ได้โดยไม่ยิงเน็ต/DB จริง):
```ts
const results = await runWatcher({
  targets,                                   // จาก Prisma
  getRobots,                                 // robots.txt ผ่าน fetchSource เดียวกัน
  fetchPage: (url) => fetchSource(url, fetchDeps),
  saveSnapshot: (s) => prisma.sourceSnapshot.create({ data: s }).then(() => {}),
  sleep: (ms) => sleep(ms),
});
const digest = renderDigest(results);       // null = ไม่มีอะไรต้องดู → ไม่ส่ง email
```

## 4. Security
### 4.1 Injection
| ภัย | กันด้วย |
|---|---|
| **SSRF** (sourceUrl ถูกแก้ให้ชี้ `169.254.169.254`, `localhost`, IP ภายใน) | allowlist ในโค้ด + ห้าม IP literal + DNS lookup แล้วห้ามวง private ทุก hop + redirect ตรวจซ้ำ |
| **SQL injection** | ใช้ Prisma query builder (parameterized) เท่านั้น ห้าม `$queryRawUnsafe` / ต่อ string เป็น SQL |
| **HTML/XSS ใน email** (ชื่อแบรนด์/URL จาก DB) | `escapeHtml` ทุกค่า, ลิงก์ได้เฉพาะ `https:` (กัน `javascript:`) |
| **เนื้อหาเว็บที่ดึงมา** | ถือเป็นข้อมูลไม่น่าเชื่อถือ: ใช้ทำ hash อย่างเดียว ไม่ render ไม่ eval ไม่เก็บทั้งหน้า (กันลิขสิทธิ์ด้วย) |
| **Prompt injection** (อนาคตถ้าใช้ LLM สกัดข้อมูล) | POC ไม่มี LLM; ถ้าเพิ่มภายหลัง ผลจาก LLM ต้องผ่าน `PromotionInput` (Zod) และลงเป็น draft ให้คนตรวจเสมอ |
| **ReDoS / หน้าใหญ่ผิดปกติ** | จำกัด 2MB + timeout 15 วิ ก่อนเข้า regex |

### 4.2 Code / pipeline
- `permissions: contents: read`, `persist-credentials: false`, `concurrency` กันรันซ้อน, `timeout-minutes: 15`
- `npm ci --ignore-scripts` กัน install script ของ dependency แล้วค่อย `prisma generate`
- secret อยู่ใน GitHub Environment `watcher` (จำกัดให้ใช้ได้เฉพาะ branch `main`) ไม่อยู่ใน `env` ระดับ workflow
- log แค่ `kind` + `promotionId` + `reason`; error log แค่ชื่อ ไม่ log message (กัน connection string หลุด)
- ทำต่อ: pin actions ด้วย commit SHA, เปิด Dependabot

### 4.3 Data / DB (สิทธิ์ต่ำสุด)
Prisma ที่ต่อด้วย `postgres` ข้าม RLS ได้ จึงให้ watcher ใช้ role แยก (Prapat รันใน SQL editor ของ Supabase เอง ห้ามใส่รหัสใน migration):
```sql
create role kerd_watcher login password '<สุ่มยาว>' noinherit;
grant usage on schema public to kerd_watcher;
grant select (id, "brandId", "sourceUrl", "verifyMethod", status) on "Promotion" to kerd_watcher;
grant select (id, name) on "Brand" to kerd_watcher;
grant select, insert on "SourceSnapshot" to kerd_watcher;
-- RLS เปิดอยู่ทุกตาราง จึงต้องมี policy ให้ role นี้
create policy watcher_read_promo on "Promotion" for select to kerd_watcher using (true);
create policy watcher_read_brand on "Brand" for select to kerd_watcher using (true);
create policy watcher_snap on "SourceSnapshot" for all to kerd_watcher using (true) with check (true);
```
แล้วใช้ connection string ของ role นี้เป็น `WATCHER_DATABASE_URL` → ถึง secret หลุด ก็แก้/ลบโปรหรืออ่านข้อมูลผู้ใช้ไม่ได้

### 4.4 กฎหมาย
- เคารพ robots.txt (ไม่มีไฟล์ = อนุญาต, ดึงไม่ได้ = ห้าม), UA ระบุตัว `KerdBot/0.1 (+https://kerd.app/bot)`
- วันละ 3 รอบ × ~5 หน้า เว้น 3 วิ ต่อ request: โหลดเบามาก
- ห้าม FB/IG/LINE/TikTok/Lemon8 (มี test ใน `allowed-hosts.test.ts`) ห้ามหน้าที่ต้อง login
- ไม่แตะข้อมูลผู้ใช้ เก็บแค่ hash + HTTP status

## 5. ข้อจำกัดที่รู้
- **DNS rebinding:** lookup กับ fetch resolve แยกกัน; ความเสี่ยงต่ำเพราะ host อยู่ใน allowlist. ถ้าต้องการปิดสนิทให้ใช้ undici `Agent` ที่ pin IP
- **หน้า JS-only** (Starbucks, After You): hash เปล่า ใช้ `manual` ตรวจทุก 30 วันตามเดิม
- **hash เปลี่ยนเพราะ banner/วันที่บนหน้า:** อาจเตือนปลอม; ถ้าเจอบ่อยค่อยเพิ่ม selector เฉพาะแบรนด์
- GitHub cron อาจช้าได้หลายนาที (ยอมรับได้)

## 6. เปิดใช้งาน (Prapat)
1. สร้าง role `kerd_watcher` (ข้อ 4.3)
2. GitHub → Settings → Environments → `watcher` → ใส่ secrets 4 ตัว + จำกัด branch `main`
3. Actions → "Watch promo sources" → Run workflow 1 ครั้ง (ได้ baseline)
4. รอบถัดไปจะส่ง email เมื่อหน้าเปลี่ยนหรือลิงก์เสีย

## 7. thai-pdpa-review (2026-10-08)
| ระดับ | ประเด็น | ทำไม | แก้ยังไง |
|---|---|---|---|
| กลาง | หน้าเว็บบล็อก bot (เช่น Starbucks 403) | ฝืนยิงต่ออาจเข้าข่ายผ่านมาตรการป้องกัน (พ.ร.บ.คอมฯ) | 403/429 ซ้ำ → เปลี่ยนเป็น `manual` ไม่หา UA/proxy อื่นมาเลี่ยง |
| ต่ำ | ลิขสิทธิ์เนื้อหาหน้าแบรนด์ | เก็บแค่ hash ไม่เก็บ/ไม่เผยแพร่ข้อความ | คงไว้แบบนี้; คำอธิบายบนเว็บเขียนเอง |
| ต่ำ | robots.txt / ToS | เคารพ robots, UA ระบุตัว, โหลดต่ำ, ไม่มีโซเชียลใน allowlist | มี test แล้ว |
| ต่ำ | ข้อมูลส่วนบุคคล | ไม่แตะข้อมูลผู้ใช้; email digest มีแค่อีเมลของ Prapat (Resend อยู่ต่างประเทศ) | ใส่ Resend ในรายชื่อ vendor + DPA |

ไม่ใช่คำปรึกษาทางกฎหมาย ก่อนเปิดเชิงพาณิชย์ควรให้นักกฎหมายตรวจ
