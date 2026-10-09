import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY, PrivacyBody } from "@/components/legal/privacy";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัวและคุกกี้",
  description: "Kerd เก็บข้อมูลอะไร ใช้คุกกี้หรือไม่ และสิทธิ์ของคุณตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title={PRIVACY.title} updated={PRIVACY.updated}>
      <PrivacyBody />
    </LegalPage>
  );
}
