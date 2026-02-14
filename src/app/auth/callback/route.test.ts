import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession,
    },
  })),
}));

import { GET, getSafeRedirectTarget } from "./route";

describe("callback redirect resolution", () => {
  it("uses internal redirect target", () => {
    const url = new URL("http://localhost:3000/auth/callback?redirectTo=/board/new");
    expect(getSafeRedirectTarget(url)).toBe("/board/new");
  });

  it("falls back for invalid redirect target", () => {
    const url = new URL("http://localhost:3000/auth/callback?redirectTo=https://evil.com");
    expect(getSafeRedirectTarget(url)).toBe("/");
  });
});

describe("callback route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb-pub",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    };
    exchangeCodeForSession.mockReset();
  });

  it("redirects to login when state is missing or mismatched", async () => {
    const req = new Request(
      "http://localhost:3000/auth/callback?code=abc&state=wrong&redirectTo=/board/new",
      { headers: { cookie: "os-oauth-state=expected" } },
    );

    const response = await GET(req);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fboard%2Fnew",
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("redirects to login when code is missing", async () => {
    const req = new Request("http://localhost:3000/auth/callback?state=expected&redirectTo=/board/new", {
      headers: { cookie: "os-oauth-state=expected" },
    });

    const response = await GET(req);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fboard%2Fnew",
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("sets auth cookies and redirects when state and code are valid", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_in: 3600,
        },
      },
      error: null,
    });

    const req = new Request(
      "http://localhost:3000/auth/callback?code=abc&state=expected&redirectTo=/board/new",
      { headers: { cookie: "os-oauth-state=expected" } },
    );

    const response = await GET(req);
    const accessCookie = response.cookies.get("os-access-token");
    const refreshCookie = response.cookies.get("os-refresh-token");
    const stateCookie = response.cookies.get("os-oauth-state");

    expect(response.headers.get("location")).toBe("http://localhost:3000/board/new");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(accessCookie?.value).toBe("access-token");
    expect(refreshCookie?.value).toBe("refresh-token");
    expect(stateCookie?.value).toBe("");
  });
});
