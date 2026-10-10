"use client";

import { useState, type ReactNode } from "react";
import { CategoryChips } from "@/components/category-chips";
import { PromoCard } from "@/components/promo-card";
import { ALL, categoryOptions, filterByCategory } from "@/lib/categories";
import { stagger } from "@/lib/motion";
import { searchPromos } from "@/lib/search";
import { cn } from "@/lib/utils";
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

// ช่องค้นหาแบบ type="search" พร้อมปุ่มล้างคำค้นขนาดแตะได้ 44px (ซ่อนปุ่ม x ของเบราว์เซอร์ให้เหลือปุ่มเดียว)
function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div role="search" className="relative">
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        aria-label="ค้นหาโปรหรือแบรนด์"
        placeholder="ค้นหาแบรนด์ หรือสิ่งที่อยากได้ เช่น กาแฟ"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full rounded-full border bg-card pr-12 pl-11 text-base text-foreground outline-none placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow] duration-200 ease-(--ease-out-quart) focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="ล้างคำค้น"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:animate-fade-up motion-safe:active:scale-95"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function FilteredPromoList({ promos }: { promos: PromoCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const [window, setWindow] = useState(ALL);
  const [query, setQuery] = useState("");
  const options = categoryOptions(promos);
  const windows = windowOptions(promos);
  const shown = filterByWindow(filterByCategory(searchPromos(promos, query), category), window);

  return (
    <div className="flex flex-col gap-4">
      <SearchBox value={query} onChange={setQuery} />
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
      {shown.length === 0 && (
        <p className="text-muted-foreground">{query.trim() ? `ไม่พบโปรที่ตรงกับ “${query.trim()}” ลองชื่อแบรนด์หรือคำอื่น` : "ไม่มีโปรที่ตรงกับตัวกรองนี้"}</p>
      )}
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
