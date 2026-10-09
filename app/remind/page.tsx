import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { loadAccount, signInWithLine, signOutAction } from "@/app/actions/account";
import { ReminderForm } from "@/components/reminder-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { lineRemindersOn } from "@/lib/features";

export const metadata: Metadata = {
  title: "เตือนฉันก่อนเดือนเกิด",
  description: "รับข้อความเตือนทาง LINE ก่อนเดือนเกิด 30 วัน ให้สมัครสมาชิกทันใช้สิทธิ์ และสรุปโปรวันแรกของเดือนเกิด",
};

function parseMonth(v: string | string[] | undefined): number | undefined {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : undefined;
}

async function RemindBody({ searchParams }: Pick<PageProps<"/remind">, "searchParams">) {
  const month = parseMonth((await searchParams).month);


  const session = await auth();
  if (!session?.user?.id) {
    return (
      <form action={signInWithLine} className="flex flex-col gap-4">
        {month && <input type="hidden" name="month" value={month} />}
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>เราได้แค่ LINE userId ไม่ได้ชื่อ รูป หรืออีเมลของคุณ</li>
          <li>เก็บแค่เดือนและวันเกิด ไม่ถามปีเกิดหรือเบอร์โทร</li>
          <li>จะส่งข้อความก็ต่อเมื่อคุณติ๊กยินยอมในขั้นถัดไปเท่านั้น</li>
        </ul>
        <Button type="submit" className="self-start">
          เข้าสู่ระบบด้วย LINE
        </Button>
      </form>
    );
  }

  const account = await loadAccount();
  return (
    <div className="flex flex-col gap-6">
      <ReminderForm account={account} defaultMonth={month} />
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          ออกจากระบบ
        </Button>
      </form>
    </div>
  );
}

export default function RemindPage({ searchParams }: PageProps<"/remind">) {
  // พักฟีเจอร์ LINE ไว้ (lib/features.ts)
  if (!lineRemindersOn(process.env)) notFound();
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold">เตือนฉันก่อนเดือนเกิด</h1>
      <p className="text-muted-foreground">
        โปรวันเกิดหลายแบรนด์ต้องเป็นสมาชิกล่วงหน้า เราจะเตือนทาง LINE ก่อนเดือนเกิด 30 วัน และสรุปโปรวันที่ 1 ของเดือนเกิด
      </p>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <RemindBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
