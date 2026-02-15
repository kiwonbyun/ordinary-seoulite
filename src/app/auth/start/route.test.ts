import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "./route";

describe("auth start route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb-pub",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    };
  });

  it("redirects to provider authorize URL with code response type", async () => {
    const req = new Request("http://localhost:3000/auth/start?redirectTo=/board/new");

    const response = await GET(req);
    const location = response.headers.get("location") ?? "";
    const authorizeUrl = new URL(location);

    expect(authorizeUrl.pathname).toBe("/auth/v1/authorize");
    expect(authorizeUrl.searchParams.get("provider")).toBe("google");
    expect(authorizeUrl.searchParams.get("response_type")).toBe("code");
    expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("s256");
    expect(authorizeUrl.searchParams.get("code_challenge")).toBeTruthy();

    const callbackUrl = new URL(authorizeUrl.searchParams.get("redirect_to") ?? "");
    expect(callbackUrl.pathname).toBe("/auth/callback");
    expect(callbackUrl.searchParams.get("redirectTo")).toBe("/board/new");

    const pkceCookie = response.cookies.get("os-pkce-code-verifier");
    expect(pkceCookie?.value).toBeTruthy();
  });
});
