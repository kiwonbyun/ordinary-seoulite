import { NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth-cookies";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.redirect(new URL("/", url.origin));
  clearAuthCookies(response, url.protocol === "https:");
  return response;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response, url.protocol === "https:");
  return response;
}
