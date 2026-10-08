import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLOWED_HOSTS } from "./allowed-hosts";
import { checkSourceUrl } from "./url-guard";

type Seed = { slug: string; verify_method: string; source_url: string };
const seed: Seed[] = JSON.parse(readFileSync(join(process.cwd(), "docs/data/poc-brands.json"), "utf8"));

describe("ALLOWED_HOSTS", () => {
  it.each(seed.filter((b) => b.verify_method === "auto").map((b) => [b.slug, b.source_url]))(
    "โปร auto ของ %s ผ่าน allowlist",
    (_slug, url) => expect(checkSourceUrl(url, ALLOWED_HOSTS).ok).toBe(true),
  );

  it("ไม่มีโดเมนโซเชียลที่ห้าม scrape", () => {
    const banned = /(facebook|fb|instagram|line\.me|tiktok|lemon8)/i;
    expect(ALLOWED_HOSTS.filter((h) => banned.test(h))).toEqual([]);
  });
});
