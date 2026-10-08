type Cause = { originalCode?: string; code?: string; originalMessage?: string; message?: string };
type PrismaLike = { name?: string; code?: string; meta?: { modelName?: string; driverAdapterError?: { cause?: Cause } } };

const redact = (s: string) => s.replace(/postgres(ql)?:\/\/\S+/gi, "postgres://***");

/** สรุป error ให้อ่านใน log ได้ โดยไม่พิมพ์ message ดิบ (อาจมี secret) ยกเว้นสาเหตุจาก DB ที่ผ่านการปิดบังแล้ว */
export function describeError(e: unknown): string {
  if (!(e instanceof Error)) return "unknown";
  const { name, code, meta } = e as Error & PrismaLike;
  const cause = meta?.driverAdapterError?.cause;
  const pgCode = cause?.originalCode ?? cause?.code;
  const pgMessage = cause?.originalMessage ?? cause?.message;
  return [
    name,
    code,
    meta?.modelName && `model=${meta.modelName}`,
    pgCode && `pg=${pgCode}`,
    pgMessage && redact(pgMessage),
  ]
    .filter(Boolean)
    .join(" ");
}
