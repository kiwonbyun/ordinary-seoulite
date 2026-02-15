import { NextResponse } from "next/server";
import { buildLoginRedirectPath, resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_PKCE_CODE_VERIFIER_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/lib/auth-cookies";

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

function clearPkceCookie(response: NextResponse, secure: boolean) {
  response.cookies.set(AUTH_PKCE_CODE_VERIFIER_COOKIE, "", {
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
  const codeVerifier = getCookieValue(req, AUTH_PKCE_CODE_VERIFIER_COOKIE);
  const safeRedirectTarget = getSafeRedirectTarget(url);
  const secure = env.siteUrl.startsWith("https://");

  if (!code || !codeVerifier) {
    const response = NextResponse.redirect(
      new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl),
    );
    clearPkceCookie(response, secure);
    return response;
  }

  const tokenResponse = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: env.supabasePublishableKey,
      authorization: `Bearer ${env.supabasePublishableKey}`,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = (await tokenResponse.json().catch(() => null)) as
    | {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      }
    | null;

  const accessToken = tokenData?.access_token;
  const refreshToken = tokenData?.refresh_token;
  const expiresIn = tokenData?.expires_in;

  if (!tokenResponse.ok || !accessToken || !refreshToken) {
    const response = NextResponse.redirect(
      new URL(buildLoginRedirectPath(safeRedirectTarget), env.siteUrl),
    );
    clearPkceCookie(response, secure);
    return response;
  }

  const response = NextResponse.redirect(new URL(safeRedirectTarget, env.siteUrl));
  response.cookies.set(AUTH_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: typeof expiresIn === "number" && Number.isFinite(expiresIn) ? expiresIn : 3600,
  });
  response.cookies.set(AUTH_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  clearPkceCookie(response, secure);

  return response;
}
