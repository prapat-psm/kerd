"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { CONSENT_PURPOSE } from "@/lib/account/consent";
import { deleteAccount, getAccount, saveReminder, type AccountDeps } from "@/lib/account/service";

const deps: AccountDeps = {
  findUser: async (lineUserId) => {
    const u = await prisma.user.findUnique({
      where: { lineUserId },
      select: {
        id: true,
        birthMonth: true,
        birthDay: true,
        consents: { where: { purpose: CONSENT_PURPOSE }, orderBy: { createdAt: "desc" }, take: 1, select: { granted: true } },
      },
    });
    return u && { id: u.id, birthMonth: u.birthMonth, birthDay: u.birthDay, marketingConsent: u.consents[0]?.granted ?? null };
  },
  upsertUser: (lineUserId, data) => prisma.user.upsert({ where: { lineUserId }, create: { lineUserId, ...data }, update: data, select: { id: true } }),
  addConsent: (userId, entry) => prisma.consentLog.create({ data: { userId, ...entry } }),
  deleteUser: (lineUserId) => prisma.user.deleteMany({ where: { lineUserId } }),
};

async function currentLineUserId(): Promise<string | null> {
  return (await auth())?.user?.id ?? null;
}

export async function loadAccount() {
  return getAccount(await currentLineUserId(), deps);
}

export async function saveReminderAction(_prev: unknown, form: FormData) {
  return saveReminder(await currentLineUserId(), Object.fromEntries(form), deps);
}

export async function deleteAccountAction() {
  const result = await deleteAccount(await currentLineUserId(), deps);
  if (result.status === "deleted") await signOut({ redirect: false });
  return result;
}

export async function signInWithLine(form: FormData) {
  const month = Number(form.get("month"));
  await signIn("line", { redirectTo: Number.isInteger(month) && month >= 1 && month <= 12 ? `/remind?month=${month}` : "/remind" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/remind" });
}
