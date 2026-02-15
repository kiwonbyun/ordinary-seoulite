import { describe, expect, it } from "vitest";
import { canManageGallery, getAuthRedirectPath, getInitial, getSafeNextPath } from "./hooks";

describe("getInitial", () => {
  it("returns first uppercase letter", () => {
    expect(getInitial("user@example.com")).toBe("U");
  });

  it("returns fallback for empty values", () => {
    expect(getInitial("")).toBe("?");
  });
});

describe("getAuthRedirectPath", () => {
  it("returns login redirect when unauthenticated", () => {
    expect(getAuthRedirectPath("/dm", false)).toBe("/login?next=%2Fdm");
  });

  it("returns null when authenticated", () => {
    expect(getAuthRedirectPath("/dm", true)).toBeNull();
  });
});

describe("canManageGallery", () => {
  it("allows only admin", () => {
    expect(canManageGallery("admin")).toBe(true);
    expect(canManageGallery("user")).toBe(false);
  });
});

describe("getSafeNextPath", () => {
  it("returns safe in-app path", () => {
    expect(getSafeNextPath("/dm", "/")).toBe("/dm");
  });

  it("falls back for unsafe absolute url", () => {
    expect(getSafeNextPath("https://evil.com", "/")).toBe("/");
  });

  it("falls back for protocol-relative path", () => {
    expect(getSafeNextPath("//evil.com", "/")).toBe("/");
  });
});
