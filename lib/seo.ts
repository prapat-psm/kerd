import { MONTHS } from "@/lib/months";

/** URL หลักของเว็บ: ตั้ง NEXT_PUBLIC_SITE_URL เมื่อโดเมน kerd.app พร้อม ไม่งั้นใช้โดเมน production ของ Vercel */
export function siteUrl(env: Record<string, string | undefined>): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

type SitemapEntry = { url: string; lastModified: Date; changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; priority: number };

export function sitemapEntries(base: string, brandSlugs: string[], now: Date): SitemapEntry[] {
  const e = (path: string, changeFrequency: SitemapEntry["changeFrequency"], priority: number): SitemapEntry => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    e("/", "daily", 1),
    ...MONTHS.map((m) => e(`/${m.slug}`, "daily", 0.9)),
    e("/brand", "weekly", 0.7),
    ...brandSlugs.map((slug) => e(`/brand/${slug}`, "weekly", 0.6)),
    e("/submit", "monthly", 0.3),
    e("/privacy", "yearly", 0.1),
    e("/terms", "yearly", 0.1),
  ];
}

export function robotsRules(base: string) {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/remind"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

const CONTEXT = "https://schema.org";

export function monthListJsonLd(base: string, monthTh: string, brands: { name: string; slug: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: `โปรวันเกิดเดือน${monthTh}`,
    itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, url: `${base}/brand/${b.slug}` })),
  };
}

export function breadcrumbJsonLd(base: string, crumbs: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${base}${c.path}` })),
  };
}

/** ใส่ใน <script type="application/ld+json"> ได้ปลอดภัย: escape "<" กันชื่อแบรนด์ปิดแท็ก script */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Kerd เกิด: เดือนเกิดนี้ ได้อะไรบ้าง? รวมโปรวันเกิดจากเว็บทางการ",
};

/** Next.js แทนที่ openGraph ของ layout ทั้งก้อนเมื่อหน้าลูกกำหนดเอง จึงต้องใส่ค่าพื้นฐานและรูปซ้ำทุกหน้า */
export function pageOpenGraph(title: string, description: string, url: string) {
  return { type: "website" as const, siteName: "Kerd · เกิด", locale: "th_TH", title, description, url, images: [OG_IMAGE] };
}
