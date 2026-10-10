import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** โครงร่างให้ขนาดใกล้การ์ดจริง เพื่อไม่ให้หน้ากระโดดตอนข้อมูลมา */
function PromoCardSkeleton() {
  return (
    <Card className="gap-4" aria-hidden>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        {/* สิทธิ์ที่ได้มักยาว 2 บรรทัดบนมือถือ */}
        <Skeleton className="h-5 w-3/5 sm:hidden" />
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48 max-sm:basis-full" />
      </CardFooter>
      {/* แถว "วิธีใช้สิทธิ์ · N ขั้น" ที่พับไว้ */}
      <div className="flex min-h-11 items-center justify-between border-t px-6 pt-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-4" />
      </div>
    </Card>
  );
}

export function PromoListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">กำลังโหลดโปร…</span>
      {Array.from({ length: count }, (_, i) => (
        <PromoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeadingSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
