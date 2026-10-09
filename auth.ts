import NextAuth from "next-auth";
import Line from "next-auth/providers/line";
import { LINE_AUTH_PARAMS, minimalSession, minimalToken } from "@/lib/account/auth-config";

// env: AUTH_SECRET, AUTH_LINE_ID, AUTH_LINE_SECRET (ดู docs/line.md); session เป็น JWT ในคุกกี้ ไม่มีตาราง session
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Line({ authorization: { params: LINE_AUTH_PARAMS } })],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt: ({ token }) => minimalToken(token),
    session: ({ session, token }) => minimalSession(session, token),
  },
});
