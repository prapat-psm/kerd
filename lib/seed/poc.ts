import { PromotionInput } from "@/lib/schemas/promotion";

type PocRecord = Record<string, unknown> & { slug?: string; brand?: string };

export type ParseResult = {
  valid: PromotionInput[];
  skipped: { slug: string; reason: string }[];
};

const orEmpty = <T>(v: T[] | null | undefined): T[] => v ?? [];

type RawTier = { tier?: unknown; benefit?: unknown; conditions?: unknown };

/** เก็บเฉพาะ tier ที่รู้ว่าได้อะไร; ถ้าไม่เหลือเลยให้เป็น null */
function knownTiers(tiers: unknown): RawTier[] | null {
  if (!Array.isArray(tiers)) return null;
  const known = (tiers as RawTier[]).filter((t) => typeof t.benefit === "string" && t.benefit.length > 0);
  return known.length ? known : null;
}

/** แปลงไฟล์ docs/data/poc-brands.json (snake_case) เป็น PromotionInput; record ที่ไม่ผ่านจะถูกข้ามพร้อมเหตุผล */
export function parsePocBrands(records: PocRecord[]): ParseResult {
  const result: ParseResult = { valid: [], skipped: [] };

  for (const r of records) {
    const slug = String(r.slug ?? r.brand ?? "unknown");
    if (r.confidence === "low") {
      result.skipped.push({ slug, reason: "confidence is low; verify manually before publishing" });
      continue;
    }

    const parsed = PromotionInput.safeParse({
      brandSlug: r.slug,
      title: r.title ?? r.brand,
      benefit: r.benefit,
      benefitType: r.benefit_type,
      window: r.window,
      windowDaysBefore: r.window_days_before ?? 0,
      windowDaysAfter: r.window_days_after ?? 0,
      tiers: knownTiers(r.tiers),
      requiresMembership: r.requires_membership ?? false,
      membershipName: r.membership_name ?? null,
      conditions: orEmpty(r.conditions as string[] | null),
      channels: orEmpty(r.channels as string[] | null),
      sourceUrl: r.source_url,
      howToRedeem: orEmpty(r.how_to_redeem as string[] | null),
      requiredDocs: orEmpty(r.required_docs as string[] | null),
      verifyMethod: r.verify_method ?? "manual",
    });

    if (parsed.success) result.valid.push(parsed.data);
    else result.skipped.push({ slug, reason: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
  }

  return result;
}
