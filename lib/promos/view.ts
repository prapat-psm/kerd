import { z } from "zod";
import { freshnessStatus, type Freshness } from "@/lib/freshness";
import { addDays } from "@/lib/dates";
import { nextOccurrence } from "@/lib/months";
import { WEEK_SPAN } from "@/lib/eligibility";

const Tiers = z.array(z.object({ tier: z.string(), benefit: z.string(), conditions: z.array(z.string()).default([]) }));
type Tier = z.infer<typeof Tiers>[number];

/** แถวจาก DB ที่หน้าเว็บใช้ (ดู lib/promos/queries.ts) */
export type PromoRow = {
  id: string;
  title: string;
  benefit: string;
  window: "day" | "week" | "month";
  windowDaysBefore: number;
  windowDaysAfter: number;
  tiers: unknown;
  requiresMembership: boolean;
  membershipName: string | null;
  requiredTier: string | null;
  conditions: string[];
  howToRedeem: string[];
  sourceUrl: string;
  validFrom: Date | null;
  validUntil: Date | null;
  lastVerifiedAt: Date | null;
  brand: { name: string; slug: string; category: string };
  feedback: { stillValid: boolean; createdAt: Date }[];
};

export type PromoCardData = Omit<PromoRow, "window" | "windowDaysBefore" | "windowDaysAfter" | "tiers" | "validFrom" | "validUntil" | "feedback"> & {
  windowLabel: string;
  tiers: Tier[] | null;
  freshness: Freshness;
};

export function windowLabel(window: PromoRow["window"], before: number, after: number): string {
  if (window === "month") return "ใช้ได้ทั้งเดือนเกิด";
  if (window === "week") return `ใช้ได้ในสัปดาห์วันเกิด (ก่อนและหลังวันเกิด ${WEEK_SPAN} วัน)`;
  if (!before && !after) return "ใช้ได้เฉพาะวันเกิด";
  const from = before ? `${before} วันก่อนวันเกิด` : "วันเกิด";
  const to = after ? ` ${after} วันหลังวันเกิด` : "วันเกิด";
  return `ใช้ได้ตั้งแต่${before ? " " : ""}${from} ถึง${to}`;
}

const thaiDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" });

export function formatThaiDate(d: Date): string {
  return thaiDate.format(d).replace("พ.ศ. ", "");
}

/** โปรยังใช้ได้ในเดือนเกิดครั้งถัดไปของเดือนนั้นหรือไม่ */
export function activeInMonth(p: Pick<PromoRow, "validFrom" | "validUntil">, month: number, today: Date): boolean {
  const { start, end } = nextOccurrence(month, today);
  if (p.validUntil && p.validUntil < start) return false;
  if (p.validFrom && p.validFrom >= addDays(end, 1)) return false;
  return true;
}

export function toCardData(row: PromoRow, now: Date): PromoCardData {
  const { window, windowDaysBefore, windowDaysAfter, tiers, feedback, ...rest } = row;
  const parsedTiers = Tiers.safeParse(tiers);
  return {
    id: rest.id,
    title: rest.title,
    benefit: rest.benefit,
    requiresMembership: rest.requiresMembership,
    membershipName: rest.membershipName,
    requiredTier: rest.requiredTier,
    conditions: rest.conditions,
    howToRedeem: rest.howToRedeem,
    sourceUrl: rest.sourceUrl,
    lastVerifiedAt: rest.lastVerifiedAt,
    brand: rest.brand,
    windowLabel: windowLabel(window, windowDaysBefore, windowDaysAfter),
    tiers: parsedTiers.success && parsedTiers.data.length ? parsedTiers.data : null,
    freshness: freshnessStatus(
      { lastVerifiedAt: rest.lastVerifiedAt, downvoteDates: feedback.filter((f) => !f.stillValid).map((f) => f.createdAt) },
      now,
    ),
  };
}
