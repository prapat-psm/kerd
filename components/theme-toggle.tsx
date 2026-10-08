"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, readStoredTheme, saveTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "ตามระบบ", Icon: Monitor },
  { value: "light", label: "สว่าง", Icon: Sun },
  { value: "dark", label: "มืด", Icon: Moon },
];

// ธีมเก็บใน localStorage; ใช้ external store เพื่อให้ฝั่ง server render เป็น "system" โดยไม่เกิด hydration error
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "system" as Theme);

  function choose(next: Theme) {
    saveTheme(next);
    applyTheme(next);
    listeners.forEach((l) => l());
  }

  return (
    <div role="group" aria-label="ธีมสี" className={cn("inline-flex gap-0.5 rounded-lg border bg-card p-0.5", className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => choose(value)}
          className="size-8 aria-pressed:bg-secondary aria-pressed:text-foreground"
        >
          <Icon aria-hidden />
        </Button>
      ))}
    </div>
  );
}
