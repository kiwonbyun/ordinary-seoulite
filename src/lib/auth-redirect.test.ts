import { describe, expect, it } from "vitest";
import { buildLoginRedirectPath, resolveRedirectTarget } from "./auth-redirect";

describe("resolveRedirectTarget", () => {
  it("accepts internal absolute paths", () => {
    expect(resolveRedirectTarget("/board/new")).toBe("/board/new");
  });

  it("falls back for external URLs", () => {
    expect(resolveRedirectTarget("https://evil.com", "/")).toBe("/");
  });

  it("falls back for empty values", () => {
    expect(resolveRedirectTarget(undefined, "/")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(resolveRedirectTarget("//evil.com", "/")).toBe("/");
  });
});

describe("buildLoginRedirectPath", () => {
  it("encodes redirect target in querystring", () => {
    expect(buildLoginRedirectPath("/board/new")).toBe("/login?redirectTo=%2Fboard%2Fnew");
  });
});
