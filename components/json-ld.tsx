import { jsonLdScript } from "@/lib/seo";

/** structured data ให้ Google เข้าใจหน้า (schema.org) */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}
