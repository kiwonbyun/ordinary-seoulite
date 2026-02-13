import { describe, expect, it } from "vitest";
import { canPost, canReply, canUploadGallery } from "./auth";

describe("auth helpers", () => {
  it("blocks anonymous users", () => {
    expect(canPost(null)).toBe(false);
  });

  it("allows operator to upload gallery", () => {
    expect(canUploadGallery({ id: "1", role: "mod" })).toBe(true);
  });

  it("allows verified to reply", () => {
    expect(canReply({ id: "2", role: "verified" })).toBe(true);
  });
});
