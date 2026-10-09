"use client";

import { useActionState, useId } from "react";
import { sendSubmission } from "@/app/actions/submission";
import { Button } from "@/components/ui/button";

const ERRORS: Record<string, string> = {
  invalid: "ส่งไม่สำเร็จ ตรวจว่าใส่ลิงก์หน้าเว็บทางการที่ขึ้นต้นด้วย https:// และกรอกช่องที่จำเป็นครบ",
  rate_limited: "ตอนนี้มีคนแจ้งเข้ามาเยอะ ลองใหม่ภายหลังได้",
};

const field =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** ฟอร์มแจ้งโปร: ไม่ถามชื่อหรือช่องทางติดต่อของผู้แจ้ง ข้อมูลเข้าคิวให้ทีมตรวจที่ต้นทางก่อน */
export function SubmissionForm() {
  const [state, action, pending] = useActionState(sendSubmission, null);
  const hint = `${useId()}-url-hint`;

  if (state?.status === "ok") {
    return (
      <p role="status" className="motion-safe:animate-fade-up rounded-lg bg-muted p-4">
        ขอบคุณครับ ทีมงานจะตรวจกับหน้าเว็บทางการก่อน แล้วเขียนรายละเอียดเองก่อนเผยแพร่
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="text" name="website" defaultValue="" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />
      <label className="flex flex-col gap-1 text-sm font-medium">
        ชื่อแบรนด์
        <input name="brandName" required maxLength={80} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        ลิงก์หน้าเว็บทางการที่บอกสิทธิ์วันเกิด
        <input name="sourceUrl" type="url" required pattern="https://.*" maxLength={500} aria-describedby={hint} className={field} />
      </label>
      <p id={hint} className="-mt-3 text-xs text-muted-foreground">
        ต้องเป็นเว็บไซต์ของแบรนด์ ไม่ใช่ Facebook, Instagram, TikTok, LINE หรือ Lemon8
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        ได้สิทธิ์อะไร
        <textarea name="benefit" required rows={2} maxLength={300} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        วิธีใช้สิทธิ์ (ไม่บังคับ)
        <textarea name="howToRedeem" rows={2} maxLength={300} className={field} />
      </label>
      <Button type="submit" disabled={pending} className="self-start">
        ส่งให้ทีมตรวจ
      </Button>
      {state && (
        <p role="alert" className="text-sm font-medium">
          <span aria-hidden>⚠️ </span>
          {ERRORS[state.status]}
        </p>
      )}
    </form>
  );
}
