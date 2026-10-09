import type { Metadata } from "next";
import { SubmissionForm } from "@/components/submission-form";

export const metadata: Metadata = {
  title: "แจ้งโปรวันเกิดที่ยังไม่มี",
  description: "เจอโปรวันเกิดที่ Kerd ยังไม่มี ส่งลิงก์หน้าเว็บทางการให้ทีมตรวจและเพิ่มได้",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold">แจ้งโปรวันเกิดที่ยังไม่มี</h1>
      <p className="text-muted-foreground">
        ทีมงานจะเปิดลิงก์ที่คุณส่ง ตรวจเงื่อนไขกับหน้าเว็บทางการ และเขียนรายละเอียดเองก่อนเผยแพร่ ข้อความที่คุณกรอกจะไม่แสดงบนเว็บโดยตรง
      </p>
      <SubmissionForm />
    </div>
  );
}
