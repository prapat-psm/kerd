import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd, jsonLdScript, promoListJsonLd, pageOpenGraph, robotsRules, siteUrl, sitemapEntries } from "./seo";

describe("siteUrl", () => {
  it("ใช้ NEXT_PUBLIC_SITE_URL ก่อน (ตัด / ท้าย)", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://kerd.app/", VERCEL_PROJECT_PRODUCTION_URL: "kerd-rust.vercel.app" })).toBe("https://kerd.app");
  });

  it("ถ้าไม่มี ใช้โดเมน production ที่ Vercel ส่งมา", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "kerd-rust.vercel.app" })).toBe("https://kerd-rust.vercel.app");
  });

  it("dev/CI ใช้ localhost", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});

describe("sitemapEntries", () => {
  const now = new Date("2026-10-09T00:00:00Z");
  const entries = sitemapEntries("https://kerd.app", ["mk-restaurants", "sizzler"], now);

  it("มีหน้าแรก หน้าแบรนด์ทั้งหมด และหน้าแบรนด์แต่ละแบรนด์ ไม่มีหน้าเดือนแล้ว (redirect ไปหน้าแรก)", () => {
    const urls = entries.map((e) => e.url);
    expect(urls[0]).toBe("https://kerd.app/");
    expect(urls).not.toContain("https://kerd.app/october");
    expect(urls).toContain("https://kerd.app/brand");
    expect(urls).toContain("https://kerd.app/brand/mk-restaurants");
    expect(urls).toHaveLength(1 + 1 + 2 + 3);
  });

  it("หน้าแรกสำคัญสุด และหน้ากฎหมายต่ำสุด", () => {
    const p = (path: string) => entries.find((e) => e.url === `https://kerd.app${path}`)!.priority;
    expect(p("/")).toBe(1);
    expect(p("/")).toBeGreaterThan(p("/brand/sizzler"));
    expect(p("/privacy")).toBeLessThan(p("/brand/sizzler"));
    expect(entries.every((e) => e.lastModified === now)).toBe(true);
  });

  it("ไม่ใส่หน้าที่ไม่ควร index", () => {
    expect(entries.map((e) => e.url).some((u) => u.includes("/remind") || u.includes("/api"))).toBe(false);
  });
});

describe("robotsRules", () => {
  it("ให้ index ทั้งเว็บ ยกเว้น api และหน้าเข้าสู่ระบบ พร้อมบอก sitemap", () => {
    expect(robotsRules("https://kerd.app")).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/remind"] }],
      sitemap: "https://kerd.app/sitemap.xml",
      host: "https://kerd.app",
    });
  });
});

describe("JSON-LD", () => {
  it("หน้าแรกเป็น ItemList ของแบรนด์ที่ลิงก์ไปหน้าแบรนด์", () => {
    expect(promoListJsonLd("https://kerd.app", [{ name: "MK", slug: "mk-restaurants" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "โปรวันเกิดและเดือนเกิดทุกแบรนด์",
      itemListElement: [{ "@type": "ListItem", position: 1, name: "MK", url: "https://kerd.app/brand/mk-restaurants" }],
    });
  });

  it("breadcrumb เรียงตำแหน่ง", () => {
    expect(breadcrumbJsonLd("https://kerd.app", [{ name: "หน้าแรก", path: "/" }, { name: "ตุลาคม", path: "/october" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://kerd.app/" },
        { "@type": "ListItem", position: 2, name: "ตุลาคม", item: "https://kerd.app/october" },
      ],
    });
  });

  it("serialize แบบกัน </script> ปิดแท็กก่อน", () => {
    expect(jsonLdScript({ name: "</script><script>alert(1)</script>" })).toBe('{"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}');
  });
});

describe("pageOpenGraph", () => {
  it("ใส่ค่าพื้นฐานของเว็บและรูป OG ทุกครั้ง (Next แทนที่ openGraph ของ layout ทั้งก้อน)", () => {
    expect(pageOpenGraph("โปรวันเกิดเดือนตุลาคม", "desc", "/october")).toEqual({
      type: "website",
      siteName: "Kerd · เกิด",
      locale: "th_TH",
      title: "โปรวันเกิดเดือนตุลาคม",
      description: "desc",
      url: "/october",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Kerd เกิด: เดือนเกิดนี้ ได้อะไรบ้าง? รวมโปรวันเกิดจากเว็บทางการ" }],
    });
  });
});
