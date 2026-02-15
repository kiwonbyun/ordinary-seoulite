import { describe, expect, it, vi } from "vitest";
import { fetchDmMessages } from "./api";

describe("fetchDmMessages", () => {
  it("loads thread messages", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: "t1" }, error: null });
    const eqThreads = vi.fn().mockReturnValue({ maybeSingle });

    const order = vi.fn().mockResolvedValue({
      data: [{ id: "m1", thread_id: "t1", sender_id: "u1", body: "hello", created_at: "2026-02-15T00:00:00Z" }],
      error: null,
    });
    const eqMessages = vi.fn().mockReturnValue({ order });

    const from = vi.fn((table: string) => {
      if (table === "dm_threads") return { select: vi.fn().mockReturnValue({ eq: eqThreads }) };
      return { select: vi.fn().mockReturnValue({ eq: eqMessages }) };
    });

    const messages = await fetchDmMessages("u1", { from } as never);
    expect(messages).toHaveLength(1);
    expect(messages[0].body).toBe("hello");
  });
});
