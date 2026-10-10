import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { PromoFeedback } from "@/components/promo-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Freshness } from "@/lib/freshness";
import { formatThaiDate, type PromoCardData } from "@/lib/promos/view";
import { cn } from "@/lib/utils";

const BADGE_LABEL: Record<Freshness, string> = {
  fresh: "ตรวจแล้ว",
  due: "ถึงรอบตรวจ",
  warn: "มีคนแจ้งปัญหา",
};

const DOT: Record<Freshness, string> = { fresh: "bg-fresh", due: "bg-due", warn: "bg-warn" };

export function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  return (
    <Badge variant={freshness}>
      {/* จุดสีใช้สีสถานะตาม branding; ตัวอักษรใช้สีหลักเพื่อให้ contrast ผ่าน AA */}
      {freshness === "warn" ? <span aria-hidden>⚠️</span> : <span aria-hidden className={`size-1.5 rounded-full ${DOT[freshness]}`} />}
      {BADGE_LABEL[freshness]}
    </Badge>
  );
}

function membershipNote(p: PromoCardData): string | null {
  if (!p.requiresMembership) return null;
  const name = p.membershipName ? ` ${p.membershipName}` : "";
  const tier = p.requiredTier ? ` ระดับ ${p.requiredTier} ขึ้นไป` : "";
  return `ต้องเป็นสมาชิก${name}${tier}`;
}

// การ์ดกะทัดรัด: สิ่งที่ได้ วันที่ตรวจล่าสุด และลิงก์ต้นทางเห็นตลอด รายละเอียดการใช้สิทธิ์พับไว้ใน <details>
// (ยังอยู่ใน DOM ให้ค้นหา/SEO เจอ ไม่ animate ความสูง ใช้แค่ fade-up ตอนเปิด)
export function PromoCard({ promo, linkBrand = false, expanded = false }: { promo: PromoCardData; linkBrand?: boolean; expanded?: boolean }) {
  const member = membershipNote(promo);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BrandMark name={promo.brand.name} slug={promo.brand.slug} />
          <h2 className="text-lg">
            {linkBrand ? (
              <Link href={`/brand/${promo.brand.slug}`} className="hover:underline">
                {promo.brand.name}
              </Link>
            ) : (
              promo.brand.name
            )}
          </h2>
        </CardTitle>
        <CardDescription>
          {promo.windowLabel}
          {promo.period && <span className="mt-0.5 block font-medium text-foreground">{promo.period}</span>}
        </CardDescription>
        <CardAction>
          <FreshnessBadge freshness={promo.freshness} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="font-medium">{promo.benefit}</p>
        {member && <p className="mt-1 text-sm text-muted-foreground">{member}</p>}
      </CardContent>

      <CardFooter className="flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground tabular-nums">
          {promo.lastVerifiedAt ? `ตรวจล่าสุดเมื่อ ${formatThaiDate(promo.lastVerifiedAt)}` : "ยังไม่ได้ตรวจ"}
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={promo.sourceUrl} target="_blank" rel="noopener noreferrer" className="group/link">
            ตรวจสิทธิ์ที่หน้าเว็บทางการ{" "}
            <span aria-hidden className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
              ↗
            </span>
          </a>
        </Button>
      </CardFooter>

      <details open={expanded} className="group border-t px-6">
        <summary
          className={cn(
            "-mx-6 flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-6 pt-3 text-sm font-semibold outline-none",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden",
          )}
        >
          <span>
            วิธีใช้สิทธิ์ <span className="font-normal text-muted-foreground">· {promo.howToRedeem.length} ขั้น</span>
          </span>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 text-muted-foreground transition-transform duration-200 ease-(--ease-out-quart) group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div className="flex flex-col gap-4 pt-2 text-sm motion-safe:animate-fade-up">
          <ol aria-label="วิธีใช้สิทธิ์" className="list-decimal space-y-1 pl-5">
            {promo.howToRedeem.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          {promo.tiers && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg bg-muted p-3">
              {promo.tiers.map((t) => (
                <div key={t.tier} className="contents">
                  <dt className="font-medium">{t.tier}</dt>
                  <dd className="text-muted-foreground">{t.benefit}</dd>
                </div>
              ))}
            </dl>
          )}

          {promo.conditions.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {promo.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">เพื่อความถูกต้อง กรุณากดลิงก์เพื่อตรวจสิทธิ์ที่ต้นทางอีกครั้งก่อนใช้สิทธิ์</p>
          <PromoFeedback promoId={promo.id} />
        </div>
      </details>
    </Card>
  );
}
