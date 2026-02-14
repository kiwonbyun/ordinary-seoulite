import { describe, expect, it } from "vitest";
import { toSessionUserView } from "./session-user";

describe("toSessionUserView", () => {
  it("uses avatar_url when present", () => {
    const view = toSessionUserView({
      email: "user@example.com",
      user_metadata: { avatar_url: "https://example.com/avatar.png" },
    });

    expect(view.avatarUrl).toBe("https://example.com/avatar.png");
    expect(view.initial).toBe("U");
  });

  it("falls back to email initial", () => {
    const view = toSessionUserView({
      email: "seoul@example.com",
      user_metadata: {},
    });

    expect(view.avatarUrl).toBeNull();
    expect(view.initial).toBe("S");
  });
});
