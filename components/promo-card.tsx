import Link from "next/link";
import type { Freshness } from "@/lib/freshness";
import { formatThaiDate, type PromoCardData } from "@/lib/promos/view";

const BADGE: Record<Freshness, { label: string; className: string }> = {
  fresh: { label: "ตรวจแล้ว", className: "bg-fresh/10 text-fresh" },
  due: { label: "ถึงรอบตรวจ", className: "bg-due/10 text-due" },
  warn: { label: "มีคนแจ้งปัญหา", className: "bg-warn/10 text-warn" },
};

export function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  const { label, className } = BADGE[freshness];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {freshness === "warn" && <span aria-hidden>⚠️</span>}
      {label}
    </span>
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
    <article className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-ink/5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">
            {linkBrand ? (
              <Link href={`/brand/${promo.brand.slug}`} className="hover:underline">
                {promo.brand.name}
              </Link>
            ) : (
              promo.brand.name
            )}
          </h3>
          <p className="text-sm text-muted">{promo.windowLabel}</p>
        </div>
        <FreshnessBadge freshness={promo.freshness} />
      </header>

      <p className="text-base font-medium text-ink">{promo.benefit}</p>
      {member && <p className="text-sm text-muted">{member}</p>}

      {promo.tiers && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {promo.tiers.map((t) => (
            <div key={t.tier} className="contents">
              <dt className="font-medium text-ink">{t.tier}</dt>
              <dd className="text-muted">{t.benefit}</dd>
            </div>
          ))}
        </dl>
      )}

      <section>
        <h4 id={stepsId} className="mb-1 text-sm font-semibold text-ink">
          วิธีใช้สิทธิ์
        </h4>
        <ol aria-labelledby={stepsId} className="list-decimal space-y-1 pl-5 text-sm text-ink">
          {promo.howToRedeem.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {promo.conditions.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {promo.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      <footer className="flex flex-col gap-2 border-t border-ink/10 pt-3 text-sm">
        <p className="text-muted tabular-nums">
          {promo.lastVerifiedAt ? `ตรวจล่าสุดเมื่อ ${formatThaiDate(promo.lastVerifiedAt)}` : "ยังไม่ได้ตรวจ"}
        </p>
        <a
          href={promo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4"
        >
          ตรวจสิทธิ์ที่หน้าเว็บทางการ ↗
        </a>
        <p className="text-xs text-muted">เพื่อความถูกต้อง กรุณากดลิงก์เพื่อตรวจสิทธิ์ที่ต้นทางอีกครั้งก่อนใช้สิทธิ์</p>
      </footer>
    </article>
  );
}
