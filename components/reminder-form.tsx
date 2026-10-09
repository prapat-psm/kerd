"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, saveReminderAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/lib/months";

type Saved = { birthMonth: number; birthDay: number | null; marketingConsent: boolean | null };

const ERRORS: Record<string, string> = {
  invalid: "บันทึกไม่สำเร็จ ตรวจวันเกิดอีกครั้ง (เช่น เมษายนไม่มีวันที่ 31)",
  unauthenticated: "หมดเวลาการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่ด้วย LINE",
};

const field =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** ฟอร์ม "เตือนฉัน" หลังเข้าสู่ระบบด้วย LINE: เก็บเดือน/วันเกิด (ไม่มีปี) + ความยินยอมแยกต่างหาก ไม่ติ๊กไว้ก่อน */
export function ReminderForm({ account, defaultMonth }: { account: Saved | null; defaultMonth?: number }) {
  const [saved, save, saving] = useActionState(saveReminderAction, null);
  const [deleted, remove, deleting] = useActionState(deleteAccountAction, null);
  const [confirming, setConfirming] = useState(false);

  if (deleted?.status === "deleted") {
    return (
      <p role="status" className="motion-safe:animate-fade-up">
        ลบข้อมูลแล้ว เราจะไม่ส่งข้อความหาคุณอีก และออกจากระบบให้แล้ว
      </p>
    );
  }

  const error = saved && saved.status !== "saved" ? ERRORS[saved.status] : null;

  return (
    <div className="flex flex-col gap-8">
      <form action={save} className="flex flex-col gap-4">
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            เดือนเกิด
            <select name="birthMonth" required defaultValue={account?.birthMonth ?? defaultMonth ?? ""} className={field}>
              <option value="" disabled>
                เลือกเดือน
              </option>
              {MONTHS.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.th}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            วันเกิด (ไม่บังคับ)
            <input type="number" name="birthDay" min={1} max={31} inputMode="numeric" defaultValue={account?.birthDay ?? ""} className={field} />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm">
          <input type="checkbox" name="marketingConsent" defaultChecked={account?.marketingConsent ?? false} className="mt-0.5 size-4 accent-primary" />
          <span>
            ยินยอมให้ Kerd ส่งข้อความเตือนโปรวันเกิดทาง LINE ปีละไม่เกิน 2 ครั้ง (ก่อนเดือนเกิด 30 วัน และวันที่ 1 ของเดือนเกิด)
            ยกเลิกได้ทุกเมื่อที่หน้านี้หรือบล็อก LINE OA
          </span>
        </label>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={saving}>
            บันทึก
          </Button>
        </div>
        {saved?.status === "saved" && (
          <p role="status" className="motion-safe:animate-fade-up text-sm">
            บันทึกแล้ว ✓
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium">
            <span aria-hidden>⚠️ </span>
            {error}
          </p>
        )}
      </form>

      {account && (
        <section className="border-t pt-4 text-sm">
          <h2 className="font-semibold">ลบข้อมูลของคุณ</h2>
          <p className="mt-1 text-muted-foreground">ลบเดือน/วันเกิด LINE userId และประวัติความยินยอมทั้งหมดออกจากระบบ</p>
          <form action={remove} className="mt-3 flex gap-2">
            {confirming ? (
              <>
                <Button type="submit" variant="outline" size="sm" disabled={deleting}>
                  ยืนยันลบ
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  ยกเลิก
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
                ลบข้อมูลของฉัน
              </Button>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
