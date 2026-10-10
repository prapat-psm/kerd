"use client";

import type { CategoryOption } from "@/lib/categories";
import { cn } from "@/lib/utils";

// ปุ่มเลือกหมวดแบบ toggle (aria-pressed) เลื่อนแนวนอนได้บนมือถือ
export function CategoryChips({
  options,
  value,
  onChange,
  label = "กรองตามหมวด",
  className,
}: {
  className?: string;
  label?: string;
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none pointer-coarse:min-h-11",
              "transition-[background-color,border-color,color,scale] duration-200 ease-(--ease-out-quart)",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:active:scale-95",
              active ? "border-foreground bg-foreground text-background forced-colors:outline-2" : "bg-card text-foreground hover:border-foreground/40",
            )}
          >
            {o.label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "text-background/70" : "bg-muted")}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}
