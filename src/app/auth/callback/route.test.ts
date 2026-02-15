import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, getSafeRedirectTarget } from "./route";

const fetchMock = vi.fn();

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
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects to login when code is missing", async () => {
    const req = new Request("http://localhost:3000/auth/callback?redirectTo=/board/new", {
      headers: { cookie: "os-pkce-code-verifier=verifier" },
    });

    const response = await GET(req);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fboard%2Fnew",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to login when verifier cookie is missing", async () => {
    const req = new Request("http://localhost:3000/auth/callback?code=abc&redirectTo=/board/new");

    const response = await GET(req);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fboard%2Fnew",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to login when token exchange fails", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 }));

    const req = new Request("http://localhost:3000/auth/callback?code=abc&redirectTo=/board/new", {
      headers: { cookie: "os-pkce-code-verifier=verifier" },
    });

    const response = await GET(req);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectTo=%2Fboard%2Fnew",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sets auth cookies and redirects when code and verifier are valid", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const req = new Request("http://localhost:3000/auth/callback?code=abc&redirectTo=/board/new", {
      headers: { cookie: "os-pkce-code-verifier=verifier" },
    });

    const response = await GET(req);
    const accessCookie = response.cookies.get("os-access-token");
    const refreshCookie = response.cookies.get("os-refresh-token");
    const pkceCookie = response.cookies.get("os-pkce-code-verifier");

    expect(response.headers.get("location")).toBe("http://localhost:3000/board/new");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/token?grant_type=pkce",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(accessCookie?.value).toBe("access-token");
    expect(refreshCookie?.value).toBe("refresh-token");
    expect(pkceCookie?.value).toBe("");
  });
});
