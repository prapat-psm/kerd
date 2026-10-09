"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_PROSE } from "@/components/legal-page";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** แสดงนโยบาย/ข้อกำหนดเป็น dialog เมื่อกดจากในเว็บ ปิดแล้วย้อนกลับหน้าเดิม (ลิงก์ตรงยังเป็นหน้าเต็ม) */
export function LegalDialog({ title, updated, href, children }: { title: string; updated: string; href: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-h-[85dvh] grid-rows-[auto_1fr] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            ปรับปรุงล่าสุด {updated} ·{" "}
            <a href={href} className="underline underline-offset-2 hover:text-foreground">
              เปิดเป็นหน้าเต็ม
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className={`-mx-6 overflow-y-auto px-6 pb-2 ${LEGAL_PROSE} [&>h2:first-child]:mt-0 [&>p:first-child]:mt-0`}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
