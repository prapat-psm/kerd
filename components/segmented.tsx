"use client";

import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SegmentOption = { value: string; label: string; disabled: boolean };

// ตัวเลือกเดียวแบบ radiogroup (ARIA APG): ลูกศรซ้ายขวาย้ายและเลือกทันที พื้นช่องที่เลือกเลื่อนตาม (CSS ล้วน)
export function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    for (let n = 1; n <= options.length; n++) {
      const i = (index + step * n + options.length) % options.length;
      if (options[i].disabled) continue;
      onChange(options[i].value);
      refs.current[i]?.focus();
      return;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid rounded-full bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        data-thumb
        style={{ "--i": index, width: `calc((100% - 0.5rem) / ${options.length})` } as CSSProperties}
        className="absolute inset-y-1 left-1 translate-x-[calc(100%*var(--i))] rounded-full bg-card shadow-sm ring-1 ring-border transition-transform duration-200 ease-(--ease-out-quart) motion-reduce:transition-none forced-colors:outline-2"
      />
      {options.map((o, i) => {
        const checked = i === index;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "relative flex min-h-9 items-center justify-center rounded-full px-1 text-sm font-medium outline-none pointer-coarse:min-h-11",
              "transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-40",
              checked ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
