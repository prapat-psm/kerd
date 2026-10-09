"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryChips } from "@/components/category-chips";
import { ALL, categoryLabel, categoryOptions, filterByCategory } from "@/lib/categories";
import { stagger } from "@/lib/motion";

export type BrandSummary = { slug: string; name: string; category: string; promoCount: number };

const byCategory = (b: BrandSummary) => b.category;

export function BrandDirectory({ brands }: { brands: BrandSummary[] }) {
  const [category, setCategory] = useState(ALL);
  const options = categoryOptions(brands, byCategory);
  const shown = filterByCategory(brands, category, byCategory);

  return (
    <div className="flex flex-col gap-4">
      {options.length > 2 && <CategoryChips options={options} value={category} onChange={setCategory} />}
      <p role="status" className="sr-only">
        แสดง {shown.length} แบรนด์
      </p>
      <ul key={category} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shown.map((b, i) => (
          <li key={b.slug} className="animate-fade-up stagger" style={stagger(i)}>
            <Link
              href={`/brand/${b.slug}`}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs transition-[translate,box-shadow,border-color] duration-200 ease-(--ease-out-quart) hover:border-primary hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5"
            >
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="text-xs text-muted-foreground">{categoryLabel(b.category)}</span>
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">{b.promoCount} โปร</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
