"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Megaphone, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "โปรวันเกิด", icon: Gift },
  { href: "/brand", label: "แบรนด์", icon: Store },
  { href: "/submit", label: "แจ้งโปร", icon: Megaphone },
];

const isCurrent = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** แถบล่างบนมือถือ (< md) ซ่อนเมื่อคีย์บอร์ดเปิด ดู [data-bottom-nav] ใน globals.css */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="เมนูหลัก"
      data-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
        {TABS.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-[color,scale] duration-150 active:scale-95",
                  current ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative grid h-8 w-14 place-items-center">
                  {current && <span aria-hidden className="absolute inset-0 rounded-full bg-secondary motion-safe:animate-pop-in" />}
                  <Icon aria-hidden className="relative size-5" />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
