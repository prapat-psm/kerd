import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** โครงร่างให้ขนาดใกล้การ์ดจริง เพื่อไม่ให้หน้ากระโดดตอนข้อมูลมา */
function PromoCardSkeleton() {
  return (
    <Card className="gap-4" aria-hidden>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/5" />
      </CardContent>
      <CardFooter className="justify-between border-t pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-40" />
      </CardFooter>
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
