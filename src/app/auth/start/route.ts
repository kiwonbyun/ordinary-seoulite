import { NextResponse } from "next/server";
import { resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";
import {
  createOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SECONDS,
} from "@/lib/oauth-state";

export async function GET(req: Request) {
  const env = validatePublicEnv(process.env);
  const url = new URL(req.url);
  const safeRedirectTo = resolveRedirectTarget(url.searchParams.get("redirectTo"), "/");
  const callbackUrl = new URL("/auth/callback", env.siteUrl);
  callbackUrl.searchParams.set("redirectTo", safeRedirectTo);

  const authorizeUrl = new URL("/auth/v1/authorize", env.supabaseUrl);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", callbackUrl.toString());
  authorizeUrl.searchParams.set("response_type", "code");
  const state = createOAuthState();
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.siteUrl.startsWith("https://"),
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  return response;
}
