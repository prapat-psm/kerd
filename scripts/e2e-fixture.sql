-- ใช้กับ DB ทดสอบใน CI เท่านั้น: publish โปรตัวอย่างหลัง seed เพื่อให้ e2e ตรวจการ์ดจริงได้
UPDATE "Promotion" p
SET status = 'published', "lastVerifiedAt" = now()
FROM "Brand" b
WHERE b.id = p."brandId" AND b.slug IN ('mk-restaurants', 'major-cineplex', 'watsons-th');
