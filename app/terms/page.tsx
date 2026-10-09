import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { TERMS, TermsBody } from "@/components/legal/terms";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน",
  description: "ข้อกำหนดการใช้งาน Kerd ความถูกต้องของข้อมูลโปร เครื่องหมายการค้า และการแจ้งแก้ไขข้อมูล",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title={TERMS.title} updated={TERMS.updated}>
      <TermsBody />
    </LegalPage>
  );
}
