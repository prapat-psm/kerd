import { LegalDialog } from "@/components/legal-dialog";
import { TERMS, TermsBody } from "@/components/legal/terms";

// กดลิงก์ /terms จากในเว็บ → เปิดเป็น dialog; เปิดลิงก์ตรงหรือโหลดใหม่ → app/terms/page.tsx (หน้าเต็ม)
export default function TermsModal() {
  return (
    <LegalDialog {...TERMS}>
      <TermsBody />
    </LegalDialog>
  );
}
