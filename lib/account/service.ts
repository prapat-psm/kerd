import { consentEntry, type ConsentEntry } from "./consent";
import { ReminderInput } from "./schema";

export type Account = { id: string; birthMonth: number; birthDay: number | null; marketingConsent: boolean | null };

export type AccountDeps = {
  /** marketingConsent = ค่าล่าสุดใน consent log (null ถ้าไม่เคยบันทึก) */
  findUser(lineUserId: string): Promise<Account | null>;
  upsertUser(lineUserId: string, data: { birthMonth: number; birthDay: number | null }): Promise<{ id: string }>;
  addConsent(userId: string, entry: ConsentEntry): Promise<unknown>;
  /** ลบ user พร้อม consent log (onDelete: Cascade) */
  deleteUser(lineUserId: string): Promise<unknown>;
};

export async function saveReminder(
  lineUserId: string | null,
  raw: unknown,
  deps: AccountDeps,
): Promise<{ status: "saved" | "invalid" | "unauthenticated" }> {
  if (!lineUserId) return { status: "unauthenticated" };
  const parsed = ReminderInput.safeParse(raw);
  if (!parsed.success) return { status: "invalid" };
  const { marketingConsent, ...birth } = parsed.data;

  const existing = await deps.findUser(lineUserId);
  const user = await deps.upsertUser(lineUserId, birth);
  const entry = consentEntry(existing?.marketingConsent ?? null, marketingConsent);
  if (entry) await deps.addConsent(user.id, entry);
  return { status: "saved" };
}

export async function getAccount(lineUserId: string | null, deps: AccountDeps): Promise<Account | null> {
  return lineUserId ? deps.findUser(lineUserId) : null;
}

export async function deleteAccount(lineUserId: string | null, deps: AccountDeps): Promise<{ status: "deleted" | "unauthenticated" }> {
  if (!lineUserId) return { status: "unauthenticated" };
  await deps.deleteUser(lineUserId);
  return { status: "deleted" };
}
