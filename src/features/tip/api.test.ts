import { describe, expect, it, vi } from "vitest";
import { createTip } from "./api";

describe("createTip", () => {
  it("creates pending tip record", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "tip1",
        user_id: "u1",
        target_type: "dm",
        target_id: "t1",
        amount: 5,
        currency: "USD",
        status: "pending",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const tip = await createTip(
      { userId: "u1", targetType: "dm", targetId: "t1", amount: 5, currency: "USD" },
      { from } as never,
    );

    expect(tip.status).toBe("pending");
  });
});
