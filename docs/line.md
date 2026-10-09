# LINE Login + เตือนฉัน

> **พักไว้ (2026-10-09):** ปุ่มเตือนฉันและหน้า `/remind` ถูกซ่อนด้วย `LINE_REMINDERS_ENABLED = false` ใน `lib/features.ts` เปิดใหม่ได้ด้วยการเปลี่ยนเป็น `true` พร้อมตั้ง env ด้านล่าง

หน้า `/remind` ใช้ Auth.js (LINE provider) แบบ JWT ในคุกกี้ ไม่มีตาราง session
ขอ scope แค่ `openid` จึงได้แค่ LINE userId (ไม่ได้ชื่อ รูป อีเมล) และ `bot_prompt=aggressive` ชวนเพิ่มเพื่อน LINE OA ตอน login
ถ้ายังไม่ตั้ง env ครบ หน้า `/remind` จะแสดง "เปิดให้ใช้เร็วๆ นี้"

## ตั้งค่าครั้งแรก (Prapat)
1. [LINE Developers](https://developers.line.biz/console/) → Provider เดียวกันสำหรับทุก channel (userId ต้องตรงกันระหว่าง Login กับ Messaging API)
2. สร้าง **LINE Login** channel (App type: Web app)
   - Callback URL: `https://kerd.app/api/auth/callback/line` และ `https://kerd-rust.vercel.app/api/auth/callback/line`
   - ไม่ต้องขอสิทธิ์ email
   - Linked LINE Official Account: เลือก OA ของ Kerd (สร้างจาก Messaging API channel ใน provider เดียวกัน)
   - เปลี่ยนสถานะเป็น **Published** ไม่งั้นมีแต่ tester ที่ login ได้
3. Vercel → Settings → Environment Variables (Production):
   - `AUTH_SECRET`: สุ่มเอง เช่น `openssl rand -base64 33`
   - `AUTH_LINE_ID`: Channel ID ของ LINE Login
   - `AUTH_LINE_SECRET`: Channel secret ของ LINE Login
4. Redeploy (merge อะไรก็ได้ หรือกด Run workflow ที่ Deploy)

ห้ามส่งค่า secret ในแชตหรือ commit ลง repo

## Dev ในเครื่อง
ใส่ 3 ค่าเดียวกันใน `.env` พร้อม `AUTH_TRUST_HOST=true` และเพิ่ม `http://localhost:3000/api/auth/callback/line` เป็น Callback URL ของ channel สำหรับ dev
