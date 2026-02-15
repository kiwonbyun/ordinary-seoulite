import { NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth-cookies";
import { validatePublicEnv } from "@/lib/env";

function clearAuthCookies(response: NextResponse, secure: boolean) {
  response.cookies.set(AUTH_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
}

function getCookieValue(req: Request, key: string) {
  const rawCookie = req.headers.get("cookie");
  if (!rawCookie) return null;

  const parts = rawCookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
}

async function revokeSupabaseSession(req: Request) {
  const accessToken = getCookieValue(req, AUTH_ACCESS_COOKIE);
  if (!accessToken) return;

  const env = validatePublicEnv(process.env);

  await fetch(`${env.supabaseUrl}/auth/v1/logout?scope=global`, {
    method: "POST",
    headers: {
      apikey: env.supabasePublishableKey,
      authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.redirect(new URL("/", url.origin));
  await revokeSupabaseSession(req).catch(() => {
    // Always clear local auth cookies even if upstream revoke fails.
  });
  clearAuthCookies(response, url.protocol === "https:");
  return response;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.json({ ok: true });
  await revokeSupabaseSession(req).catch(() => {
    // Always clear local auth cookies even if upstream revoke fails.
  });
  clearAuthCookies(response, url.protocol === "https:");
  return response;
}
