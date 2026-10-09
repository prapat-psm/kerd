import type { MetadataRoute } from "next";
import { getBrandSlugs } from "@/lib/promos/queries";
import { siteUrl, sitemapEntries } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries(siteUrl(process.env), await getBrandSlugs(), new Date());
}
