import { describe, expect, it } from "vitest";
import { getBoardNewRedirectPath } from "./session-gate";

describe("getBoardNewRedirectPath", () => {
  it("returns login redirect for anonymous users", () => {
    expect(getBoardNewRedirectPath(null)).toBe("/login?redirectTo=%2Fboard%2Fnew");
  });

  it("returns null for authenticated users", () => {
    expect(getBoardNewRedirectPath({ id: "user-1" })).toBeNull();
  });
});
