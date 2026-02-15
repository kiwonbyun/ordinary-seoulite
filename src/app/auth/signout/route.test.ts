import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const fetchMock = vi.fn();

describe("auth signout route", () => {
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

  it("POST revokes remote session and clears auth cookies", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const req = new Request("http://localhost:3000/auth/signout", {
      method: "POST",
      headers: { cookie: "os-access-token=access-token; os-refresh-token=refresh-token" },
    });

    const response = await POST(req);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/logout?scope=global",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer access-token",
          apikey: "sb-pub",
        }),
      }),
    );
    expect(response.cookies.get("os-access-token")?.value).toBe("");
    expect(response.cookies.get("os-refresh-token")?.value).toBe("");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("GET redirects home and still clears cookies", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const req = new Request("http://localhost:3000/auth/signout", {
      method: "GET",
      headers: { cookie: "os-access-token=access-token" },
    });

    const response = await GET(req);

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(response.cookies.get("os-access-token")?.value).toBe("");
    expect(response.cookies.get("os-refresh-token")?.value).toBe("");
  });

  it("still clears cookies when revoke call fails", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    const req = new Request("http://localhost:3000/auth/signout", {
      method: "POST",
      headers: { cookie: "os-access-token=access-token" },
    });

    const response = await POST(req);

    expect(response.cookies.get("os-access-token")?.value).toBe("");
    expect(response.cookies.get("os-refresh-token")?.value).toBe("");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
