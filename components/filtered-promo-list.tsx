"use client";

import { useState } from "react";
import { CategoryChips } from "@/components/category-chips";
import { PromoCard } from "@/components/promo-card";
import { ALL, categoryOptions, filterByCategory } from "@/lib/categories";
import { stagger } from "@/lib/motion";
import type { PromoCardData } from "@/lib/promos/view";

export function FilteredPromoList({ promos }: { promos: PromoCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const options = categoryOptions(promos);
  const shown = filterByCategory(promos, category);

  return (
    <div className="flex flex-col gap-4">
      {options.length > 2 && <CategoryChips options={options} value={category} onChange={setCategory} />}
      <p role="status" className="sr-only">
        แสดง {shown.length} โปร
      </p>
      {/* เปลี่ยน key ตามหมวด ให้การ์ดเล่น animation เข้ามาใหม่ทุกครั้งที่กรอง */}
      <div key={category} className="flex flex-col gap-4">
        {shown.map((p, i) => (
          <div key={p.id} className="animate-fade-up stagger" style={stagger(i)}>
            <PromoCard promo={p} linkBrand />
          </div>
        ))}
      </div>
    </div>
  );
}
