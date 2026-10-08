import { daysBetween } from "./dates";

export const VERIFY_EVERY_DAYS = 30;
export const DOWNVOTE_THRESHOLD = 7;
export const DOWNVOTE_WINDOW_DAYS = 7;

export type Freshness = "fresh" | "due" | "warn";

export type FreshnessInput = {
  lastVerifiedAt: Date | null;
  downvoteDates: Date[];
};

export function freshnessStatus({ lastVerifiedAt, downvoteDates }: FreshnessInput, now = new Date()): Freshness {
  const windowStart = now.getTime() - DOWNVOTE_WINDOW_DAYS * 86_400_000;
  const recentDownvotes = downvoteDates.filter(
    (d) => d.getTime() >= windowStart && (!lastVerifiedAt || d > lastVerifiedAt),
  ).length;

  if (recentDownvotes >= DOWNVOTE_THRESHOLD) return "warn";
  if (!lastVerifiedAt || daysBetween(lastVerifiedAt, now) > VERIFY_EVERY_DAYS) return "due";
  return "fresh";
}
