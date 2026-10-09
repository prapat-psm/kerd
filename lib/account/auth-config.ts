/** LINE Login: ขอแค่ openid เพื่อได้ userId และชวนเพิ่มเพื่อน OA (ต้องผูก OA กับ Login channel) */
export const LINE_AUTH_PARAMS = { scope: "openid", bot_prompt: "aggressive" } as const;

export function lineLoginEnabled(env: Record<string, string | undefined>): boolean {
  return Boolean(env.AUTH_SECRET && env.AUTH_LINE_ID && env.AUTH_LINE_SECRET);
}

/** JWT ในคุกกี้เก็บแค่ sub (LINE userId) ไม่เก็บชื่อ รูป หรือ email */
export function minimalToken(token: { sub?: string; [key: string]: unknown }): { sub?: string } {
  return { sub: token.sub };
}

export function minimalSession(session: { expires: string; user?: unknown }, token: { sub?: string }) {
  return { expires: session.expires, user: { id: token.sub } };
}
