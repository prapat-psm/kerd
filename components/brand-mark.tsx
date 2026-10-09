import Image from "next/image";
import { brandInitials } from "@/lib/brand-initials";
import { brandLogo } from "@/lib/brand-logos";
import { cn } from "@/lib/utils";

/** โลโก้แบรนด์ที่อนุญาตแล้ว หรืออักษรย่อที่เราวาดเอง (branding.md: ไม่ใช้โลโก้แบรนด์อื่นโดยไม่ได้รับอนุญาต) */
export function BrandMark({ name, slug, className }: { name: string; slug: string; className?: string }) {
  const logo = brandLogo(slug);
  return (
    <span
      aria-hidden="true"
      data-slot="brand-mark"
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold tracking-tight text-foreground ring-1 ring-primary/30",
        logo && "bg-card",
        className,
      )}
    >
      {logo ? <Image src={logo.src} alt="" width={48} height={48} className="size-full object-contain p-1" /> : brandInitials(name)}
    </span>
  );
}
