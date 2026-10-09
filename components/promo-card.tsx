import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { PromoFeedback } from "@/components/promo-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Freshness } from "@/lib/freshness";
import { formatThaiDate, type PromoCardData } from "@/lib/promos/view";

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

export function PromoCard({ promo, linkBrand = false }: { promo: PromoCardData; linkBrand?: boolean }) {
  const member = membershipNote(promo);
  const stepsId = `steps-${promo.id}`;

  return (
    <Card className="gap-4 transition-[translate,box-shadow] duration-200 ease-(--ease-out-quart) hover:shadow-md motion-safe:hover:-translate-y-0.5">
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
        <CardDescription>{promo.windowLabel}</CardDescription>
        <CardAction>
          <FreshnessBadge freshness={promo.freshness} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="font-medium">{promo.benefit}</p>
          {member && <p className="mt-1 text-sm text-muted-foreground">{member}</p>}
        </div>

        {promo.tiers && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg bg-muted p-3 text-sm">
            {promo.tiers.map((t) => (
              <div key={t.tier} className="contents">
                <dt className="font-medium">{t.tier}</dt>
                <dd className="text-muted-foreground">{t.benefit}</dd>
              </div>
            ))}
          </dl>
        )}

        <section>
          <h3 id={stepsId} className="mb-1 text-sm font-semibold">
            วิธีใช้สิทธิ์
          </h3>
          <ol aria-labelledby={stepsId} className="list-decimal space-y-1 pl-5 text-sm">
            {promo.howToRedeem.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {promo.conditions.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {promo.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2 border-t pt-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
        </div>
        <p className="text-xs text-muted-foreground">เพื่อความถูกต้อง กรุณากดลิงก์เพื่อตรวจสิทธิ์ที่ต้นทางอีกครั้งก่อนใช้สิทธิ์</p>
        <PromoFeedback promoId={promo.id} />
      </CardFooter>
    </Card>
  );
}
