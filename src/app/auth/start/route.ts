import { NextResponse } from "next/server";
import { resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";
import { AUTH_PKCE_CODE_VERIFIER_COOKIE } from "@/lib/auth-cookies";
import {
  generatePkceCodeChallenge,
  generatePkceCodeVerifier,
} from "@/lib/pkce";

export async function GET(req: Request) {
  const env = validatePublicEnv(process.env);
  const url = new URL(req.url);
  const safeRedirectTo = resolveRedirectTarget(
    url.searchParams.get("redirectTo"),
    "/"
  );
  const callbackUrl = new URL("/auth/callback", env.siteUrl);
  callbackUrl.searchParams.set("redirectTo", safeRedirectTo);

  const authorizeUrl = new URL("/auth/v1/authorize", env.supabaseUrl);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", callbackUrl.toString());
  authorizeUrl.searchParams.set("response_type", "code");
  const codeVerifier = generatePkceCodeVerifier();
  const codeChallenge = generatePkceCodeChallenge(codeVerifier);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "s256");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(AUTH_PKCE_CODE_VERIFIER_COOKIE, codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.siteUrl.startsWith("https://"),
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
