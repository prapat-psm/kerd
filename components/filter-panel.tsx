"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CategoryChips } from "@/components/category-chips";
import { Segmented, type SegmentOption } from "@/components/segmented";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CategoryOption } from "@/lib/categories";

// ปุ่ม "ตัวกรอง" เปิด panel เลือกหมวดและช่วงที่ใช้ได้ เลือกแล้วรายการด้านหลังกรองทันที (ไม่มีปุ่มยืนยัน)
// จอเล็กเป็นแผ่นจากขอบล่าง นิ้วโป้งเอื้อมถึง จอใหญ่เป็น dialog กลางจอ
export function FilterPanel({
  categories,
  category,
  onCategory,
  windows,
  window,
  onWindow,
  active,
  onReset,
}: {
  categories: CategoryOption[] | null;
  category: string;
  onCategory: (value: string) => void;
  windows: SegmentOption[] | null;
  window: string;
  onWindow: (value: string) => void;
  active: boolean;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" aria-haspopup="dialog" data-active={active || undefined} onClick={() => setOpen(true)} className="relative rounded-full">
        <SlidersHorizontal aria-hidden />
        ตัวกรอง
        {active && <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-foreground ring-2 ring-background motion-safe:animate-pop-in" />}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-6 sm:max-w-md max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-sm:motion-safe:animate-fade-up">
          <DialogHeader>
            <DialogTitle>ตัวกรอง</DialogTitle>
            <DialogDescription>เลือกแล้วรายการโปรเปลี่ยนตามทันที</DialogDescription>
          </DialogHeader>
          {categories && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">หมวด</h3>
              <CategoryChips options={categories} value={category} onChange={onCategory} counts={false} className="mx-0 flex-wrap px-0" />
            </section>
          )}
          {windows && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">ใช้ได้ช่วง</h3>
              <Segmented label="กรองตามช่วงที่ใช้ได้" options={windows} value={window} onChange={onWindow} />
            </section>
          )}
          <div className="flex items-center justify-between gap-3">
            {active ? (
              <Button variant="ghost" onClick={onReset} className="-ml-3">
                ล้าง
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={() => setOpen(false)}>ดูโปร</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
