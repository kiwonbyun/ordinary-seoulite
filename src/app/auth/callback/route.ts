import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildLoginRedirectPath, resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth-cookies";
import { OAUTH_STATE_COOKIE, verifyOAuthState } from "@/lib/oauth-state";

export function getSafeRedirectTarget(url: URL) {
  return resolveRedirectTarget(url.searchParams.get("redirectTo"), "/");
}

function getCookieValue(req: Request, key: string) {
  const rawCookie = req.headers.get("cookie");
  if (!rawCookie) return null;

  const parts = rawCookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
}

function clearStateCookie(response: NextResponse, secure: boolean) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
}

export async function GET(req: Request) {
  const env = validatePublicEnv(process.env);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = getCookieValue(req, OAUTH_STATE_COOKIE);
  const safeRedirectTarget = getSafeRedirectTarget(url);
  const secure = env.siteUrl.startsWith("https://");

  if (!code || !verifyOAuthState(stateCookie, state)) {
    const response = NextResponse.redirect(
      new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl),
    );
    clearStateCookie(response, secure);
    return response;
  }

  const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    const response = NextResponse.redirect(
      new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl),
    );
    clearStateCookie(response, secure);
    return response;
  }

  const response = NextResponse.redirect(new URL(safeRedirectTarget, env.siteUrl));
  response.cookies.set(AUTH_ACCESS_COOKIE, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: data.session.expires_in ?? 3600,
  });
  response.cookies.set(AUTH_REFRESH_COOKIE, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  clearStateCookie(response, secure);

  return response;
}
