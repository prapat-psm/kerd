import { LegalDialog } from "@/components/legal-dialog";
import { PRIVACY, PrivacyBody } from "@/components/legal/privacy";

// กดลิงก์ /privacy จากในเว็บ → เปิดเป็น dialog; เปิดลิงก์ตรงหรือโหลดใหม่ → app/privacy/page.tsx (หน้าเต็ม)
export default function PrivacyModal() {
  return (
    <LegalDialog {...PRIVACY}>
      <PrivacyBody />
    </LegalDialog>
  );
}
