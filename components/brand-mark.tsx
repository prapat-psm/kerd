import { brandInitials } from "@/lib/brand-initials";
import { cn } from "@/lib/utils";

/** อักษรย่อของแบรนด์ที่เราวาดเอง ใช้แทนโลโก้จริง (branding.md: ไม่ใช้โลโก้แบรนด์อื่นโดยไม่ได้รับอนุญาต) */
export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="brand-mark"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold tracking-tight text-foreground ring-1 ring-primary/30",
        className,
      )}
    >
      {brandInitials(name)}
    </span>
  );
}
