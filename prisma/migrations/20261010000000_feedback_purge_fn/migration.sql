-- PDPA: ลบรายละเอียด/สาขาที่ผู้ใช้พิมพ์ใน 👎 เมื่อเก่ากว่า 180 วัน (lib/feedback/retention.ts)
-- watcher ใช้ role kerd_watcher ที่อ่านตาราง PromoFeedback ไม่ได้ จึงเรียก function นี้แทน
-- function รันด้วยสิทธิ์เจ้าของ ทำได้แค่ล้าง note/branch ที่เก่าเกินกำหนด ไม่คืนข้อมูลผู้ใช้
CREATE FUNCTION public.purge_old_feedback_notes() RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  purged integer;
BEGIN
  UPDATE "PromoFeedback" SET note = NULL, branch = NULL
  WHERE "createdAt" < now() - interval '180 days'
    AND (note IS NOT NULL OR branch IS NOT NULL);
  GET DIAGNOSTICS purged = ROW_COUNT;
  RETURN purged;
END
$$;

REVOKE ALL ON FUNCTION public.purge_old_feedback_notes() FROM PUBLIC;

-- role เหล่านี้มีเฉพาะบน Supabase / prod (DB ทดสอบใน CI ไม่มี)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON FUNCTION public.purge_old_feedback_notes() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kerd_watcher') THEN
    GRANT EXECUTE ON FUNCTION public.purge_old_feedback_notes() TO kerd_watcher;
  END IF;
END
$$;
