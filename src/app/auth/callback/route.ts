import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildLoginRedirectPath, resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth-cookies";

export function getSafeRedirectTarget(url: URL) {
  return resolveRedirectTarget(url.searchParams.get("redirectTo"), "/");
}

export async function GET(req: Request) {
  const env = validatePublicEnv(process.env);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const safeRedirectTarget = getSafeRedirectTarget(url);
  const secure = env.siteUrl.startsWith("https://");

  if (!code) {
    return NextResponse.redirect(new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl));
  }

  const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl));
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

  return response;
}
