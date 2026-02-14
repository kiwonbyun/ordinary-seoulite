import { NextResponse } from "next/server";
import { resolveRedirectTarget } from "@/lib/auth-redirect";
import { validatePublicEnv } from "@/lib/env";

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

  return NextResponse.redirect(authorizeUrl);
}
