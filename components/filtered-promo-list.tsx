"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { PromoCard } from "@/components/promo-card";
import { Button } from "@/components/ui/button";
import { ALL, categoryLabel, categoryOptions, filterByCategory } from "@/lib/categories";
import { stagger } from "@/lib/motion";
import { brandSuggestions, searchPromos, type BrandSuggestion } from "@/lib/search";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import { filterByWindow, windowOptions, windowSegments } from "@/lib/windows";
import type { PromoCardData } from "@/lib/promos/view";

// รอให้หยุดพิมพ์ก่อนค่อยกรอง การ์ดจะได้ไม่กระพริบทุกตัวอักษร
export const SEARCH_DEBOUNCE_MS = 250;

// แสดงการ์ดทีละหน้า เลื่อนถึงท้ายรายการแล้วโหลดหน้าถัดไป
export const PAGE_SIZE = 5;

// จุดท้ายรายการ: เลื่อนมาใกล้แล้วโหลดเพิ่มเอง ปุ่ม "ดูเพิ่ม" สำรองไว้สำหรับคีย์บอร์ดและเบราว์เซอร์ที่ไม่มี IntersectionObserver
function LoadMore({ onMore }: { onMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const more = useRef(onMore);
  useEffect(() => {
    more.current = onMore;
  });
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !ref.current) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && more.current(), { rootMargin: "400px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex justify-center">
      <Button variant="outline" onClick={onMore} className="rounded-full">
        ดูเพิ่ม
      </Button>
    </div>
  );
}

// ช่องค้นหาแบบ combobox (ARIA APG): พิมพ์แล้วมีรายชื่อแบรนด์ให้เลือกด้วยคลิกหรือลูกศร + Enter
function SearchBox({
  value,
  suggestions,
  onChange,
  onPick,
}: {
  value: string;
  suggestions: BrandSuggestion[];
  onChange: (value: string) => void;
  onPick: (brand: BrandSuggestion) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const expanded = open && suggestions.length > 0;
  const optionId = (i: number) => `${id}-brand-${i}`;

  const pick = (brand: BrandSuggestion) => {
    onPick(brand);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!suggestions.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (expanded && active >= 0) pick(suggestions[active]);
      else setOpen(false);
    }
  };

  return (
    <div role="search" className="relative">
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute top-6 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        role="combobox"
        aria-label="ค้นหาโปรหรือแบรนด์"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={`${id}-brands`}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        placeholder="ค้นหาแบรนด์ หรือสิ่งที่อยากได้ เช่น กาแฟ"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
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
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          className="absolute top-6 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:animate-fade-up motion-safe:active:scale-95"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
      {expanded && (
        <ul
          id={`${id}-brands`}
          role="listbox"
          aria-label="แบรนด์ที่ตรงกับคำค้น"
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border bg-card py-1 shadow-lg motion-safe:animate-fade-up"
        >
          {suggestions.map((b, i) => (
            <li
              key={b.slug}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // กันช่องค้นหาเสีย focus (blur ปิดรายการ) ก่อนคลิกจะทำงาน
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(b)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 transition-colors duration-150",
                i === active ? "bg-muted" : "hover:bg-muted",
              )}
            >
              <span className="font-medium text-foreground">{b.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {categoryLabel(b.category)} · {b.count} โปร
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FilteredPromoList({ promos }: { promos: PromoCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const [window, setWindow] = useState(ALL);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  // ล้างคำค้นแล้วแสดงทุกการ์ดทันที ไม่ต้องรอ debounce
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const term = query ? debounced : "";
  const options = categoryOptions(promos);
  const matched = brand ? promos.filter((p) => p.brand.slug === brand) : searchPromos(promos, term);
  // แถวช่วงแสดงตามโปรทั้งหมด (ไม่กระโดดหายตอนเปลี่ยนหมวด) แต่จำนวนนับเฉพาะหมวดที่เลือก ช่วงที่หมวดนี้ไม่มีกดไม่ได้
  const showCategories = options.length > 2;
  const showWindows = windowOptions(promos).length > 2;
  const segments = windowSegments(filterByCategory(promos, category));
  // ช่วงที่เลือกไว้ไม่มีในหมวดใหม่ กลับเป็น "ทั้งหมด" แทนหน้าว่าง
  const activeWindow = segments.some((w) => w.value === window && !w.disabled) ? window : ALL;
  const shown = filterByWindow(filterByCategory(matched, category), activeWindow);
  const suggestions = brand ? [] : brandSuggestions(promos, term);
  const filtered = category !== ALL || activeWindow !== ALL || Boolean(brand) || term.trim() !== "";
  const clearFilters = () => {
    setCategory(ALL);
    setWindow(ALL);
    setQuery("");
    setBrand(null);
  };
  // เปลี่ยนตัวกรองแล้วเริ่มนับหน้าใหม่ (ปรับ state ระหว่าง render แทน effect จะได้ไม่กระพริบ)
  const filterKey = [category, activeWindow, brand, term].join("|");
  const [page, setPage] = useState({ key: filterKey, size: PAGE_SIZE });
  if (page.key !== filterKey) setPage({ key: filterKey, size: PAGE_SIZE });
  const size = page.key === filterKey ? page.size : PAGE_SIZE;
  const visible = shown.slice(0, size);

  return (
    <div className="flex flex-col gap-4">
      <SearchBox
        value={query}
        suggestions={suggestions}
        onChange={(value) => {
          setQuery(value);
          setBrand(null);
        }}
        onPick={(b) => {
          setQuery(b.name);
          setBrand(b.slug);
        }}
      />
      <div className="flex min-h-8 items-center justify-between gap-3 text-sm text-muted-foreground">
        <p role="status" className="tabular-nums">
          {filtered ? `${shown.length} จาก ${promos.length} โปร` : `${promos.length} โปร`}
        </p>
        <div className="flex items-center gap-1">
          {filtered && shown.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="motion-safe:animate-fade-in">
              ล้างตัวกรอง
            </Button>
          )}
          {(showCategories || showWindows) && (
            <FilterPanel
              categories={showCategories ? options : null}
              category={category}
              onCategory={setCategory}
              windows={showWindows ? segments : null}
              window={activeWindow}
              onWindow={setWindow}
              active={category !== ALL || activeWindow !== ALL}
              onReset={() => {
                setCategory(ALL);
                setWindow(ALL);
              }}
            />
          )}
        </div>
      </div>
      {shown.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed px-5 py-6 motion-safe:animate-fade-up">
          <p className="text-foreground">{term.trim() ? `ยังไม่มีโปรที่ตรงกับ “${term.trim()}”` : "ยังไม่มีโปรที่ตรงกับตัวกรองนี้"}</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            ล้างตัวกรอง
          </Button>
          <p className="text-sm text-muted-foreground">
            รู้จักโปรนี้?{" "}
            <Link href="/submit" className="font-medium text-foreground underline underline-offset-4">
              แจ้งเราได้
            </Link>
          </p>
        </div>
      )}
      {/* ไม่เปลี่ยน key ตามตัวกรอง: การ์ดที่ยังอยู่ไม่ขยับ เล่น animation เฉพาะการ์ดที่เพิ่งโผล่ */}
      <div className="flex flex-col gap-4">
        {visible.map((p, i) => (
          // หน้าใหม่เริ่มหน่วงจาก 0 ไม่ต้องรอการ์ดหน้าก่อน
          <div key={p.id} className="animate-fade-up stagger" style={stagger(i % PAGE_SIZE)}>
            <PromoCard promo={p} linkBrand />
          </div>
        ))}
      </div>
      {/* key ตามจำนวนที่แสดง: mount ใหม่ทุกหน้า ถ้าจุดท้ายยังอยู่ในจอ (จอสูง) จะโหลดหน้าถัดไปต่อเอง */}
      {visible.length < shown.length && <LoadMore key={size} onMore={() => setPage({ key: filterKey, size: size + PAGE_SIZE })} />}
    </div>
  );
}
