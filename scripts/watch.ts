import "dotenv/config";
import { lookup } from "node:dns/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "../generated/prisma/client";
import { ALLOWED_HOSTS } from "../lib/watcher/allowed-hosts";
import { renderDigest } from "../lib/watcher/digest";
import { fetchSource, type FetchDeps } from "../lib/watcher/fetch-source";
import { runWatcher } from "../lib/watcher/run";

// ตรวจ env ก่อนเริ่ม ไม่ log ค่า secret
const Env = z.object({
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  DIGEST_TO: z.email().optional(),
  DIGEST_FROM: z.string().min(1).optional(),
});
const env = Env.parse(process.env);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });

const fetchDeps: FetchDeps = {
  allowedHosts: ALLOWED_HOSTS,
  lookup: async (host) => (await lookup(host, { all: true })).map((a) => a.address),
  fetch: (url, init) => fetch(url, init),
  maxBytes: 2_000_000,
  timeoutMs: 15_000,
};

async function getRobots(origin: string): Promise<string> {
  const r = await fetchSource(`${origin}/robots.txt`, fetchDeps);
  if (r.ok) return r.body;
  // RFC 9309: ไม่มีไฟล์ (4xx) = อนุญาต, ดึงไม่ได้ = ถือว่าห้ามทั้งหมด
  return r.status && r.status >= 400 && r.status < 500 ? "" : "User-agent: *\nDisallow: /";
}

async function sendDigest(subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.DIGEST_TO || !env.DIGEST_FROM) {
    console.log("ข้าม email: ยังไม่ได้ตั้ง RESEND_API_KEY / DIGEST_TO / DIGEST_FROM");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.DIGEST_FROM, to: [env.DIGEST_TO], subject, html }),
  });
  if (!res.ok) throw new Error(`resend_${res.status}`);
}

async function main() {
  const promos = await prisma.promotion.findMany({
    where: { verifyMethod: "auto", status: { in: ["draft", "published"] } },
    select: {
      id: true,
      sourceUrl: true,
      brand: { select: { name: true } },
      snapshots: {
        where: { contentHash: { not: "" } },
        orderBy: { fetchedAt: "desc" },
        take: 1,
        select: { contentHash: true },
      },
    },
  });

  const results = await runWatcher({
    targets: promos.map((p) => ({
      promotionId: p.id,
      brandName: p.brand.name,
      sourceUrl: p.sourceUrl,
      lastHash: p.snapshots[0]?.contentHash ?? null,
    })),
    getRobots,
    fetchPage: (url) => fetchSource(url, fetchDeps),
    // Prisma ใช้ parameterized query เสมอ ห้ามใช้ $queryRawUnsafe
    saveSnapshot: async (s) => {
      await prisma.sourceSnapshot.create({ data: s });
    },
    sleep: (ms) => sleep(ms),
  });

  for (const r of results) console.log(`${r.kind.padEnd(9)} ${r.promotionId}${r.reason ? ` ${r.reason}` : ""}`);

  const digest = renderDigest(results);
  if (digest) await sendDigest(digest.subject, digest.html);
}

main()
  .catch((e) => {
    // log แค่ชื่อ error ไม่ log message/stack ที่อาจมี connection string
    console.error("watcher failed:", e instanceof Error ? e.name : "unknown");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
