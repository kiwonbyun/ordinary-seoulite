import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import { redirect } from "next/navigation";
import { getSessionUserFromCookies, type SessionUser } from "@/lib/server-auth";

type OptionalSessionUser = { id: string } | null;

export function getBoardNewRedirectPath(user: OptionalSessionUser) {
  if (!user) return buildLoginRedirectPath("/board/new");
  return null;
}

export async function requireSessionUser(redirectTo: string): Promise<SessionUser> {
  const user = await getSessionUserFromCookies();
  if (!user) {
    redirect(buildLoginRedirectPath(redirectTo));
  }
  return user;
}
