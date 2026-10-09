"use client";

import { useState, type ReactNode } from "react";
import { CategoryChips } from "@/components/category-chips";
import { PromoCard } from "@/components/promo-card";
import { ALL, categoryOptions, filterByCategory } from "@/lib/categories";
import { stagger } from "@/lib/motion";
import { filterByWindow, windowOptions } from "@/lib/windows";
import type { PromoCardData } from "@/lib/promos/view";

// ป้ายสั้นหน้าแถวตัวกรอง (ชื่อเต็มอยู่ใน aria-label ของกลุ่มปุ่มแล้ว จึงซ่อนจาก screen reader)
function FilterRow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="w-16 shrink-0 text-xs text-muted-foreground">
        {caption}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function FilteredPromoList({ promos }: { promos: PromoCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const [window, setWindow] = useState(ALL);
  const options = categoryOptions(promos);
  const windows = windowOptions(promos);
  const shown = filterByWindow(filterByCategory(promos, category), window);

  return (
    <div className="flex flex-col gap-4">
      {options.length > 2 && (
        <FilterRow caption="หมวด">
          <CategoryChips className="ml-0 pl-0" options={options} value={category} onChange={setCategory} />
        </FilterRow>
      )}
      {windows.length > 2 && (
        <FilterRow caption="ใช้ได้ช่วง">
          <CategoryChips className="ml-0 pl-0" label="กรองตามช่วงที่ใช้ได้" options={windows} value={window} onChange={setWindow} />
        </FilterRow>
      )}
      <p role="status" className="sr-only">
        แสดง {shown.length} โปร
      </p>
      {shown.length === 0 && <p className="text-muted-foreground">ไม่มีโปรที่ตรงกับตัวกรองนี้</p>}
      {/* เปลี่ยน key ตามตัวกรอง ให้การ์ดเล่น animation เข้ามาใหม่ทุกครั้งที่กรอง */}
      <div key={`${category}-${window}`} className="flex flex-col gap-4">
        {shown.map((p, i) => (
          <div key={p.id} className="animate-fade-up stagger" style={stagger(i)}>
            <PromoCard promo={p} linkBrand />
          </div>
        ))}
      </div>
    </div>
  );
}
