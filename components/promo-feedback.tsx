"use client";

import { useActionState, useId, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { sendFeedback } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import { FEEDBACK_REASONS, reasonLabel } from "@/lib/feedback/schema";
import type { FeedbackResult } from "@/lib/feedback/submit";

const ERRORS: Record<Exclude<FeedbackResult["status"], "ok">, string> = {
  rate_limited: "ตอนนี้มีคนแจ้งโปรนี้เยอะมาก ทีมงานรับเรื่องแล้ว ลองใหม่ภายหลังได้",
  invalid: "ส่งไม่สำเร็จ ตรวจข้อมูลอีกครั้ง (ถ้าเลือก 'อื่นๆ' ต้องอธิบายสั้นๆ)",
  not_found: "ไม่พบโปรนี้แล้ว อาจถูกนำออกระหว่างที่เปิดหน้าอยู่",
};

const field =
  "w-full rounded-md border bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** 👍/👎 ใต้การ์ดโปร; 👎 ต้องเลือกเหตุผล (docs/design.md ข้อ 3) ไม่เก็บชื่อ ติดต่อกลับ หรือ IP */
export function PromoFeedback({ promoId }: { promoId: string }) {
  const [state, action, pending] = useActionState(sendFeedback, null);
  const [open, setOpen] = useState(false);
  const uid = useId();

  if (state?.status === "ok") {
    return (
      <p role="status" className="motion-safe:animate-fade-up text-sm text-muted-foreground">
        ขอบคุณที่ช่วยตรวจ ทีมงานจะเทียบกับหน้าเว็บทางการอีกครั้ง
      </p>
    );
  }

  const ids = { q: `${uid}-q`, reason: `${uid}-reason`, hint: `${uid}-hint` };

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-labelledby={ids.q} className="flex flex-wrap items-center gap-2">
        <span id={ids.q} className="mr-auto text-sm text-muted-foreground">
          ข้อมูลนี้ยังใช้ได้ไหม
        </span>
        <form action={action}>
          <input type="hidden" name="promotionId" value={promoId} />
          <input type="hidden" name="stillValid" value="true" />
          <Button type="submit" variant="ghost" size="sm" disabled={pending}>
            <ThumbsUp aria-hidden /> ใช้ได้
          </Button>
        </form>
        <Button type="button" variant="ghost" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ThumbsDown aria-hidden /> ไม่ถูกต้อง
        </Button>
      </div>

      {open && (
        <form action={action} aria-label="แจ้งข้อมูลไม่ถูกต้อง" className="motion-safe:animate-fade-up flex flex-col gap-3 rounded-lg bg-muted p-3">
          <input type="hidden" name="promotionId" value={promoId} />
          <input type="hidden" name="stillValid" value="false" />
          {/* ช่องดักบอท: คนมองไม่เห็นและ tab ไม่ถึง */}
          <input type="text" name="website" defaultValue="" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

          <div role="radiogroup" aria-labelledby={ids.reason} className="flex flex-col gap-2">
            <span id={ids.reason} className="text-sm font-semibold">
              เกิดอะไรขึ้น
            </span>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_REASONS.map((r) => (
                <label
                  key={r}
                  className="inline-flex cursor-pointer items-center rounded-full border bg-card px-3 py-1.5 text-sm transition-[background-color,border-color,color,scale] duration-200 ease-(--ease-out-quart) has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 motion-safe:active:scale-95"
                >
                  <input type="radio" name="reason" value={r} required className="sr-only" />
                  {reasonLabel(r)}
                </label>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span>รายละเอียด (ไม่บังคับ ยกเว้นเลือก &lsquo;อื่นๆ&rsquo;)</span>
            <textarea name="note" rows={2} maxLength={300} aria-describedby={ids.hint} className={field} />
          </label>
          <p id={ids.hint} className="-mt-2 text-xs text-muted-foreground">
            ไม่ต้องใส่ชื่อหรือเบอร์โทร เราใช้ข้อความนี้ตรวจโปรเท่านั้น และลบทิ้งภายใน 180 วัน
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span>สาขา (ไม่บังคับ)</span>
            <input type="text" name="branch" maxLength={80} className={field} />
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              ส่งรายงาน
            </Button>
          </div>
        </form>
      )}

      {state && (
        <p role="alert" className="text-sm font-medium">
          <span aria-hidden>⚠️ </span>
          {ERRORS[state.status as keyof typeof ERRORS]}
        </p>
      )}
    </div>
  );
}
