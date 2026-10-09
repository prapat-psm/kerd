import type { ReactNode } from "react";

export const CONTACT_EMAIL = "kerd.app@gmail.com";

/** โครงหน้าข้อความยาว (นโยบาย/ข้อกำหนด) */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="pt-4 text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_a]:underline-offset-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">ปรับปรุงล่าสุด {updated}</p>
      {children}
    </article>
  );
}
